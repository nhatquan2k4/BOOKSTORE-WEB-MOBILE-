namespace BookStore.Shared.Constants
{
    // Mẫu chuẩn hóa kết quả: thành công/thất bại, thông điệp, dữ liệu trả về
    public class Result<T>
    {
        public bool IsSuccess { get; }          // Kết quả thành công hay thất bại

        public string? Error { get; }          // Thông điệp lỗi (nếu có)

        public T? Value { get; }                // Dữ liệu trả về khi thành công (null khi thất bại)


        private Result(bool isSuccess, T? value, string? error)//private constructor: bắt buộc tạo qua Success/Failure để tránh sai sót
        {
            IsSuccess = isSuccess;
            Value = value;
            Error = error;
        }

        public static Result<T> Success(T value) => new Result<T>(true, value, null); // Tạo kết quả thành công kèm dữ liệu
        public static Result<T> Failure(string error) => new Result<T>(false, default, error); // Tạo kết quả thất bại kèm thông điệp lỗi
    }
}
