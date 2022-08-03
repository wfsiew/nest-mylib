export class Pager {
  
  total: number;
  pageNum: number;
  pageSize: number;

  constructor(total: number, pageNum: number, pageSize: number) {
    this.total = total;
    this.pageNum = pageNum;
    this.setPageSize(pageSize);
  }

  setPageSize(pageSize: number) {
    if ((this.total < pageSize || pageSize < 1) && this.total > 0) {
      this.pageSize = this.total;
    }

    else {
      this.pageSize = pageSize;
    }

    if (this.totalPages < this.pageNum) {
      this.pageNum = this.totalPages;
    }

    if (this.pageNum < 1) {
      this.pageNum = 1;
    }
  }

  get lowerBound() {
    return (this.pageNum - 1) * this.pageSize;
  }

  get upperBound() {
    let x = this.pageNum * this.pageSize;
    if (this.total < x) {
      x = this.total;
    }

    return x;
  }

  get totalPages() {
    let v = this.total * 1.00 / this.pageSize;
    let x = Math.ceil(v);
    return x;
  }
}