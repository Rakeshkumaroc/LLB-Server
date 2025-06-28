class ApiResponse {
  constructor(statusCode, message = "success", resData) {
    this.statusCode = statusCode || 200;
    this.message = message || "successfully";
    this.success = true;
    this.resData = resData;
  }
}

module.exports = ApiResponse;
