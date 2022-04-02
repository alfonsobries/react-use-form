import { deepCopy } from '../utils';

class Form {
  // eslint-disable-next-line no-undef
  [key: string]: any;

  originalData: Record<string, any> = {};

  constructor(data: Record<string, any> = {}) {
    this.update(data);
  }

  update(data: Record<string, any>) {
    this.originalData = Object.assign({}, this.originalData, deepCopy(data));

    Object.assign(this, data);
  }
}

export default Form;
