var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react"), require("axios")) : typeof define === "function" && define.amd ? define(["exports", "react", "axios"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["@alfonsobries/react-use-form"] = {}, global.React, global.axios));
})(this, function(exports2, react, axios) {
  "use strict";
  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { "default": e };
  }
  var axios__default = /* @__PURE__ */ _interopDefaultLegacy(axios);
  const FormContext = react.createContext(void 0);
  function deepCopy(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    const copy = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach((key) => {
      copy[key] = deepCopy(obj[key]);
    });
    return copy;
  }
  function arrayWrap(value) {
    return Array.isArray(value) ? value : [value];
  }
  function hasFiles(data) {
    return data instanceof File || data instanceof Blob || typeof FileList !== "undefined" && data instanceof FileList || typeof data === "object" && data !== null && Object.values(data).find((value) => hasFiles(value)) !== void 0;
  }
  class Errors {
    constructor([state, setState]) {
      __publicField(this, "state");
      __publicField(this, "setState");
      this.state = state;
      this.setState = setState;
    }
    set(errorsOrField, fieldMessages) {
      if (typeof errorsOrField === "object") {
        this.setState(() => errorsOrField);
      } else {
        this.setState((state) => ({
          ...state,
          [errorsOrField]: arrayWrap(fieldMessages)
        }));
      }
    }
    get(field) {
      if (this.state[field] !== void 0) {
        return this.state[field][0];
      }
      return void 0;
    }
    getAll(field) {
      if (this.state[field] !== void 0) {
        return this.state[field];
      }
      return void 0;
    }
    has(field) {
      return this.state[field] !== void 0;
    }
    any() {
      return Object.keys(this.state).length > 0;
    }
    all() {
      return this.state;
    }
    flatten() {
      return Object.values(this.state).reduce((errors, fieldErrors) => [...errors, ...fieldErrors], []);
    }
    clear(fieldOrFields) {
      if (fieldOrFields === void 0) {
        this.setState({});
        return;
      }
      this.setState((state) => {
        const newState = { ...state };
        const fields = arrayWrap(fieldOrFields);
        fields.forEach((field) => {
          delete newState[field];
        });
        return newState;
      });
    }
  }
  const _Form = class {
    constructor(formState, errorsState) {
      __publicField(this, "originalData");
      __publicField(this, "formState");
      __publicField(this, "errors");
      this.formState = formState;
      this.errors = new Errors(errorsState);
      this.originalData = deepCopy(formState[0].data);
    }
    setState(field, value) {
      this.formState[1]((state) => ({
        ...state,
        [field]: value
      }));
    }
    getField(key) {
      return this.formState[0]["data"][key];
    }
    set(key, value) {
      this.setState("data", {
        ...this.formState[0]["data"],
        [key]: value
      });
    }
    keys() {
      return Object.keys(this.formState[0].data);
    }
    fill(data = {}) {
      this.setState("data", {
        ...this.formState[0]["data"],
        ...data
      });
    }
    data() {
      return this.keys().reduce((data, key) => ({ ...data, [key]: this.getField(key) }), {});
    }
    reset() {
      this.setState("data", this.originalData);
    }
    startProcessing() {
      this.errors.clear();
      this.formState[1]((state) => ({
        ...state,
        busy: true,
        successful: false,
        progress: void 0
      }));
    }
    finishProcessing() {
      this.formState[1]((state) => ({
        ...state,
        busy: false,
        successful: true,
        progress: void 0
      }));
    }
    get(url, config = {}) {
      return this.submit("get", url, config);
    }
    post(url, config = {}) {
      return this.submit("post", url, config);
    }
    patch(url, config = {}) {
      return this.submit("patch", url, config);
    }
    put(url, config = {}) {
      return this.submit("put", url, config);
    }
    delete(url, config = {}) {
      return this.submit("delete", url, config);
    }
    submit(method, url, config = {}) {
      this.startProcessing();
      config = {
        data: {},
        params: {},
        url,
        method,
        onUploadProgress: this.handleUploadProgress.bind(this),
        ...config
      };
      if (method.toLowerCase() === "get") {
        config.params = { ...this.data(), ...config.params };
      } else {
        config.data = { ...this.data(), ...config.data };
        if (hasFiles(config.data) && !config.transformRequest) {
          config.transformRequest = [(data) => this.toFormData(data)];
        }
      }
      return new Promise((resolve, reject) => {
        (_Form.axios || axios__default["default"]).request(config).then((response) => {
          this.finishProcessing();
          resolve(response);
        }).catch((error) => {
          this.handleErrors(error);
          reject(error);
        });
      });
    }
    handleErrors(error) {
      if (error.response) {
        this.errors.set(this.extractErrors(error.response));
      }
      this.formState[1]((state) => ({
        ...state,
        busy: false,
        progress: void 0
      }));
    }
    extractErrors(response) {
      if (!response.data || typeof response.data !== "object") {
        return { error: [_Form.errorMessage] };
      }
      if (response.data.errors) {
        return { ...response.data.errors };
      }
      if (response.data.message) {
        return { error: [response.data.message] };
      }
      return { ...response.data };
    }
    handleUploadProgress(event) {
      this.setState("progress", {
        total: event.total,
        loaded: event.loaded,
        percentage: Math.round(event.loaded * 100 / (event.total || 0))
      });
    }
    toFormData(data) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (typeof FileList !== "undefined" && value instanceof FileList) {
          [].slice.call(value).forEach((file) => formData.append(key, file));
        } else {
          formData.append(key, value);
        }
      });
      return formData;
    }
  };
  let Form = _Form;
  __publicField(Form, "axios");
  __publicField(Form, "errorMessage", "Something went wrong. Please try again.");
  const useForm = (data, axiosInstance) => {
    const axios2 = react.useContext(FormContext) || axiosInstance;
    if (axios2 !== void 0) {
      Form.axios = axios2;
    }
    const formState = react.useState({
      data,
      busy: false,
      successful: false,
      progress: void 0
    });
    const errorsState = react.useState({});
    const form = new Form(formState, errorsState);
    return new Proxy(form, {
      get(form2, attribute) {
        if (form2.keys().includes(attribute)) {
          return form2.getField(attribute);
        }
        if (["progress", "busy", "successful"].includes(attribute)) {
          return form2.formState[0][attribute];
        }
        return form2[attribute];
      }
    });
  };
  exports2.FormContext = FormContext;
  exports2["default"] = useForm;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
//# sourceMappingURL=index.umd.js.map
