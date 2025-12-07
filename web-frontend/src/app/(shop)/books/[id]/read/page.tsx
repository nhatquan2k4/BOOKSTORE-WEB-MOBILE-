// E-Book Reader Page - Trang đọc sách điện tử
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Badge, Modal, ModalHeader, ModalTitle, ModalBody } from "@/components/ui";

// Types
interface BookContent {
  id: number;
  title: string;
  author: string;
  totalPages: number;
  chapters: Chapter[];
}

interface Chapter {
  id: number;
  title: string;
  pages: Page[];
}

interface Page {
  id: number;
  content: string;
}

interface ReadingSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: "light" | "sepia" | "dark";
  textAlign: "left" | "justify";
  columnCount: 1 | 2;
}

// Mock book content
const mockBookContent: BookContent = {
  id: 1,
  title: "Clean Code: A Handbook of Agile Software Craftsmanship",
  author: "Robert C. Martin",
  totalPages: 464,
  chapters: [
    {
      id: 1,
      title: "Chương 1: Clean Code",
      pages: [
        {
          id: 1,
          content: `<h2>Chương 1: Clean Code</h2>
          
<p>Có hai phần trong việc học viết code sạch. Đầu tiên, bạn phải biết các nguyên tắc, mẫu và thực hành của code sạch. Bạn phải làm việc chăm chỉ. Thứ hai, bạn phải thực hành.</p>

<h3>Sẽ có Code Tồi</h3>

<p>Tôi đã có hơn 42 năm lập trình. Trong thời gian đó, tôi đã thấy nhiều code tồi tệ. Tôi đã viết một số code tồi tệ đó. Tôi đã phải duy trì code tồi tệ của người khác.</p>

<h3>Giá phải trả của Code Tồi</h3>

<p>Bạn đã từng bị chậm lại đáng kể bởi code tồi không? Mức độ làm chậm lại có thể rất lớn. Trong vòng một hoặc hai năm, các team có thể bị chậm lại đáng kể bởi code tồi.</p>

<h3>Code Sạch là gì?</h3>

<ul>
<li><strong>Dễ đọc:</strong> Code sạch nên dễ đọc như văn xuôi tốt</li>
<li><strong>Đơn giản:</strong> Code sạch nên đơn giản và trực tiếp</li>
<li><strong>Biểu cảm:</strong> Code sạch nên nói rõ ý định của nó</li>
<li><strong>Tối thiểu:</strong> Code sạch nên chứa ít phụ thuộc càng tốt</li>
</ul>

<blockquote>
<p>"Sự khác biệt giữa một lập trình viên thông minh và một lập trình viên chuyên nghiệp là lập trình viên chuyên nghiệp hiểu rằng sự rõ ràng là chìa khóa." - Robert C. Martin</p>
</blockquote>

<p style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; color: #6b7280; text-align: center;">
--- Hết trang 1 / 4 ---
</p>`,
        },
        {
          id: 2,
          content: `<h3>Những Tên Có Ý Nghĩa</h3>

<p>Tên là ở khắp mọi nơi trong phần mềm. Chúng ta đặt tên cho các biến, hàm, tham số, lớp và gói. Vì chúng ta làm rất nhiều, chúng ta nên làm tốt.</p>

<h4>Sử dụng Tên Có Ý Định Rõ Ràng</h4>

<pre><code>// Tồi
int d; // elapsed time in days

// Tốt
int elapsedTimeInDays;</code></pre>

<h4>Tránh Thông Tin Sai Lệch</h4>

<p>Lập trình viên phải tránh để lại các manh mối sai về ý nghĩa của code.</p>

<h4>Tên Class và Method</h4>

<p>Các class nên có tên danh từ như Customer, WikiPage, Account. Các method nên có tên động từ như postPayment, deletePage, save.</p>

<pre><code>string name = employee.getName();
customer.setName("mike");</code></pre>

<blockquote>
<p>"Code được đọc nhiều hơn là nó được viết, vì vậy hãy tối ưu hóa khả năng đọc."</p>
</blockquote>

<p style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; color: #6b7280; text-align: center;">
--- Hết trang 2 / 4 ---
</p>`,
        },
      ],
    },
    {
      id: 2,
      title: "Chương 2: Functions",
      pages: [
        {
          id: 3,
          content: `<h2>Chương 2: Functions (Hàm)</h2>

<p>Functions là những khối xây dựng đầu tiên của bất kỳ chương trình nào.</p>

<h3>Nhỏ!</h3>

<p>Quy tắc đầu tiên của function là chúng nên nhỏ. Các function hiếm khi nên dài hơn 20 dòng.</p>

<pre><code>// Tốt - function nhỏ
public static String renderPage(
    PageData pageData) throws Exception {
    if (isTestPage(pageData))
        includeSetupAndTeardown(pageData);
    return pageData.getHtml();
}</code></pre>

<h3>Làm Một Việc</h3>

<blockquote>
<p><strong>FUNCTIONS NÊN LÀM MỘT VIỆC. CHÚNG NÊN LÀM TỐT VIỆC ĐÓ.</strong></p>
</blockquote>

<p style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; color: #6b7280; text-align: center;">
--- Hết trang 3 / 4 ---
</p>`,
        },
        {
          id: 4,
          content: `<h3>Không Có Side Effects</h3>

<p>Side effects là những lời nói dối. Function của bạn hứa làm một việc, nhưng nó cũng làm những việc ẩn khác.</p>

<h3>Don't Repeat Yourself (DRY)</h3>

<p>Trùng lặp có thể là gốc rễ của mọi điều xấu trong phần mềm.</p>

<h3>Kết Luận</h3>

<p>Nghệ thuật lập trình là, và luôn luôn là, nghệ thuật của thiết kế ngôn ngữ.</p>

<blockquote>
<p>"Truth can only be found in one place: the code." - Robert C. Martin</p>
</blockquote>

<p style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; color: #6b7280; text-align: center;">
--- Hết trang 4 / 4 ---
</p>`,
        },
      ],
    },
  ],
};

export default function EbookReaderPage() {
  const router = useRouter();

  // State
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showBookmark, setShowBookmark] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 16,
    fontFamily: "serif",
    lineHeight: 1.8,
    theme: "light",
    textAlign: "justify",
    columnCount: 1,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = mockBookContent.chapters.reduce(
    (sum, chapter) => sum + chapter.pages.length,
    0
  );

  const currentAbsolutePage =
    mockBookContent.chapters
      .slice(0, currentChapter)
      .reduce((sum, chapter) => sum + chapter.pages.length, 0) +
    currentPage +
    1;

  // Navigation
  const goToNextPage = useCallback(() => {
    const currentChapterData = mockBookContent.chapters[currentChapter];
    if (currentPage < currentChapterData.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapter < mockBookContent.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
    }
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentChapter, currentPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(
        mockBookContent.chapters[currentChapter - 1].pages.length - 1
      );
    }
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentChapter, currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "Escape") {
        setShowSettings(false);
        setShowTOC(false);
        setShowBookmark(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNextPage, goToPrevPage]);

  // Toggle bookmark
  const toggleBookmark = () => {
    if (bookmarks.includes(currentAbsolutePage)) {
      setBookmarks(bookmarks.filter((b) => b !== currentAbsolutePage));
    } else {
      setBookmarks([...bookmarks, currentAbsolutePage]);
    }
  };

  // Theme styles
  const themeStyles = {
    light: { bg: "bg-white", text: "text-gray-900", border: "border-gray-200" },
    sepia: { bg: "bg-amber-50", text: "text-amber-950", border: "border-amber-200" },
    dark: { bg: "bg-gray-900", text: "text-gray-100", border: "border-gray-700" },
  };

  const currentTheme = themeStyles[settings.theme];
  const currentChapterData = mockBookContent.chapters[currentChapter];
  const currentPageData = currentChapterData.pages[currentPage];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 ${currentTheme.bg} border-b ${currentTheme.border} shadow-sm backdrop-blur-sm bg-opacity-95`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="font-bold text-sm line-clamp-1">{mockBookContent.title}</h1>
                <p className="text-xs opacity-60">{mockBookContent.author}</p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowTOC(true)} title="Mục lục">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                className={bookmarks.includes(currentAbsolutePage) ? "text-yellow-500" : ""}
                title={bookmarks.includes(currentAbsolutePage) ? "Xóa bookmark" : "Thêm bookmark"}
              >
                <svg
                  className="w-5 h-5"
                  fill={bookmarks.includes(currentAbsolutePage) ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBookmark(true)} title="Danh sách bookmark">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} title="Cài đặt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs opacity-60 mb-1">
              <span>{currentChapterData.title} - Trang {currentPage + 1}/{currentChapterData.pages.length}</span>
              <span>{currentAbsolutePage}/{totalPages} ({Math.round((currentAbsolutePage / totalPages) * 100)}%)</span>
            </div>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(currentAbsolutePage / totalPages) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div
            ref={contentRef}
            className={`prose prose-lg ${settings.theme === "dark" ? "prose-invert" : ""} max-w-none transition-all duration-300`}
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily === "serif" ? "Georgia, serif" : settings.fontFamily === "sans" ? "system-ui, sans-serif" : "monospace",
              lineHeight: settings.lineHeight,
              textAlign: settings.textAlign,
              columnCount: settings.columnCount,
              columnGap: "3rem",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: currentPageData.content }} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={goToPrevPage}
              disabled={currentChapter === 0 && currentPage === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Trang trước
            </Button>

            <Badge variant="info" size="md">
              {currentAbsolutePage} / {totalPages}
            </Badge>

            <Button
              variant="primary"
              onClick={goToNextPage}
              disabled={currentChapter === mockBookContent.chapters.length - 1 && currentPage === currentChapterData.pages.length - 1}
            >
              Trang sau
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} size="md">
        <ModalHeader>
          <ModalTitle>⚙️ Cài đặt đọc</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Cỡ chữ: {settings.fontSize}px</label>
              <input type="range" min="12" max="24" value={settings.fontSize} onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>12px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium mb-2">Phông chữ</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "serif", label: "Serif" },
                  { value: "sans", label: "Sans" },
                  { value: "mono", label: "Mono" },
                ].map((font) => (
                  <Button
                    key={font.value}
                    variant={settings.fontFamily === font.value ? "primary" : "outline"}
                    onClick={() => setSettings({ ...settings, fontFamily: font.value })}
                    size="sm"
                  >
                    {font.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium mb-2">Khoảng cách dòng: {settings.lineHeight}</label>
              <input type="range" min="1.2" max="2.5" step="0.1" value={settings.lineHeight} onChange={(e) => setSettings({ ...settings, lineHeight: Number(e.target.value) })} className="w-full" />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-2">Chủ đề</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "☀️ Sáng" },
                  { value: "sepia", label: "📜 Sepia" },
                  { value: "dark", label: "🌙 Tối" },
                ].map((theme) => (
                  <Button
                    key={theme.value}
                    variant={settings.theme === theme.value ? "primary" : "outline"}
                    onClick={() => setSettings({ ...settings, theme: theme.value as "light" | "sepia" | "dark" })}
                    size="sm"
                  >
                    {theme.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-sm font-medium mb-2">Căn lề</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "left", label: "◀ Trái" },
                  { value: "justify", label: "▦ Đều" },
                ].map((align) => (
                  <Button
                    key={align.value}
                    variant={settings.textAlign === align.value ? "primary" : "outline"}
                    onClick={() => setSettings({ ...settings, textAlign: align.value as "left" | "justify" })}
                    size="sm"
                  >
                    {align.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Column Count */}
            <div>
              <label className="block text-sm font-medium mb-2">Số cột</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 1, label: "1 cột" },
                  { value: 2, label: "2 cột" },
                ].map((col) => (
                  <Button
                    key={col.value}
                    variant={settings.columnCount === col.value ? "primary" : "outline"}
                    onClick={() => setSettings({ ...settings, columnCount: col.value as 1 | 2 })}
                    size="sm"
                  >
                    {col.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Table of Contents Modal */}
      <Modal isOpen={showTOC} onClose={() => setShowTOC(false)} size="md">
        <ModalHeader>
          <ModalTitle>📚 Mục lục</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockBookContent.chapters.map((chapter, idx) => (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapter(idx);
                  setCurrentPage(0);
                  setShowTOC(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  currentChapter === idx
                    ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="font-medium">{chapter.title}</div>
                <div className="text-sm opacity-60 mt-1 flex items-center gap-2">
                  <Badge variant="info" size="sm">
                    {chapter.pages.length} trang
                  </Badge>
                  {currentChapter === idx && (
                    <Badge variant="success" size="sm">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Đang đọc
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ModalBody>
      </Modal>

      {/* Bookmarks Modal */}
      <Modal isOpen={showBookmark} onClose={() => setShowBookmark(false)} size="md">
        <ModalHeader>
          <ModalTitle>🔖 Bookmark ({bookmarks.length})</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-gray-500">Chưa có bookmark nào</p>
              <p className="text-sm text-gray-400 mt-2">Nhấn biểu tượng bookmark để lưu trang</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bookmarks.sort((a, b) => a - b).map((pageNum) => (
                <div key={pageNum} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <button
                    onClick={() => {
                      let remaining = pageNum - 1;
                      let chapterIdx = 0;
                      while (remaining >= mockBookContent.chapters[chapterIdx].pages.length) {
                        remaining -= mockBookContent.chapters[chapterIdx].pages.length;
                        chapterIdx++;
                      }
                      setCurrentChapter(chapterIdx);
                      setCurrentPage(remaining);
                      setShowBookmark(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium">Trang {pageNum}</div>
                    <div className="text-sm opacity-60 mt-1">
                      <Badge variant="info" size="sm">
                        {Math.round((pageNum / totalPages) * 100)}% sách
                      </Badge>
                    </div>
                  </button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBookmarks(bookmarks.filter((b) => b !== pageNum))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
