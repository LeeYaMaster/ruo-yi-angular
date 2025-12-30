/**
 * 通用工具函数
 */

/**
 * 参数处理（将对象转换为URL查询字符串）
 * @param params 参数对象
 * @returns 查询字符串
 */
export function tansParams(params: any): string {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + '=';
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result;
}

/**
 * 验证是否为blob格式
 * @param data 数据
 * @returns 是否为blob
 */
export function blobValidate(data: any): boolean {
  return data.type !== 'application/json';
}

/**
 * 日期格式化
 * @param time 时间
 * @param pattern 格式
 * @returns 格式化后的时间字符串
 */
export function parseTime(time: any, pattern?: string): string | null {
  if (!time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date: Date;

  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time.replace(/-/gm, '/').replace('T', ' ').replace(/\.[\d]{3}/gm, '');
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }

  const formatObj: any = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };

  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });

  return timeStr;
}

/**
 * 表单重置
 * @param form 表单对象
 */
export function resetForm(form: any): void {
  if (form) {
    form.reset();
  }
}

