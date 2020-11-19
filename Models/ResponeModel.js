var ResponseModel = function (TotalPages, PageNumber,Data) {
    this.TotalPages = TotalPages,
      this.PageNumber = PageNumber,
      this.Data = Data
  };

  module.exports = ResponseModel;