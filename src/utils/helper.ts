const dateformat = require('dateformat');

export class Helper {

  static getDateStr(o): string {
    if (o instanceof Date) {
      return dateformat(o, 'yyyy-mm-dd');
    }

    let s = String(o);
    let a = s.length >= 10 ? s.substring(0, 10) : s;
    return a;
  }

  static getNum(s: string) {
    let r = s.replace(/[^\d\.]*/g, '');
    return parseFloat(r);
  }
}
