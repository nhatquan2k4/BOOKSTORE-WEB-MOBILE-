// src/types/dtos.ts

export interface AuthorDto {
  id: string;
  name: string;
  // Lưu ý: Map chính xác theo C# (AvartarUrl), dù từ gốc tiếng Anh là Avatar
  avartarUrl?: string | null; 
  bookCount: number;
}

// Nếu BookDto của bạn có chứa danh sách tác giả, hãy cập nhật nó:
export interface BookDto {
  id: string;
  title: string;
  // ... các trường cũ ...
  
  // Cập nhật trường này nếu Backend trả về List<AuthorDto>
  authors?: AuthorDto[]; 
  
  // Hoặc nếu Backend chỉ trả về List<string> tên tác giả
  authorNames?: string[]; 
}