import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'apps' },
    { id: 'account', name: 'Tài khoản', icon: 'person' },
    { id: 'order', name: 'Đơn hàng', icon: 'receipt' },
    { id: 'payment', name: 'Thanh toán', icon: 'wallet' },
    { id: 'other', name: 'Khác', icon: 'help-circle' },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'account',
      question: 'Làm thế nào để đăng ký làm shipper?',
      answer:
        'Để đăng ký làm shipper, bạn cần chuẩn bị: CMND/CCCD, giấy phép lái xe, đăng ký xe, bảo hiểm xe. Sau đó liên hệ hotline 1900xxxx hoặc gửi email đăng ký về support@bookstore.com',
    },
    {
      id: 2,
      category: 'account',
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer:
        'Tại màn hình đăng nhập, chọn "Quên mật khẩu", nhập số điện thoại đã đăng ký, bạn sẽ nhận được mã OTP qua SMS để đặt lại mật khẩu.',
    },
    {
      id: 3,
      category: 'order',
      question: 'Làm sao để nhận đơn hàng mới?',
      answer:
        'Đơn hàng mới sẽ hiển thị ở tab Trang chủ. Bạn có thể bật tính năng "Tự động nhận đơn" trong Cài đặt để tự động nhận đơn phù hợp với khu vực của bạn.',
    },
    {
      id: 4,
      category: 'order',
      question: 'Tôi có thể hủy đơn hàng đã nhận không?',
      answer:
        'Bạn chỉ có thể hủy đơn trước khi bắt đầu lấy hàng. Sau khi đã xác nhận lấy hàng, việc hủy đơn có thể ảnh hưởng đến uy tín và bị phạt.',
    },
    {
      id: 5,
      category: 'order',
      question: 'Khách hàng không nhận máy, tôi phải làm gì?',
      answer:
        'Hãy liên hệ khách hàng qua điện thoại. Nếu không liên lạc được sau 3 lần gọi, chụp ảnh bằng chứng và liên hệ tổng đài hỗ trợ để được xử lý.',
    },
    {
      id: 6,
      category: 'payment',
      question: 'Khi nào tôi nhận được tiền?',
      answer:
        'Tiền giao hàng sẽ được cập nhật vào ví sau khi bạn hoàn thành đơn hàng. Bạn có thể rút tiền về tài khoản ngân hàng bất kỳ lúc nào.',
    },
    {
      id: 7,
      category: 'payment',
      question: 'Phí rút tiền là bao nhiêu?',
      answer:
        'Hiện tại miễn phí rút tiền về tài khoản ngân hàng. Thời gian xử lý từ 1-3 ngày làm việc.',
    },
    {
      id: 8,
      category: 'payment',
      question: 'Tại sao đơn hàng của tôi bị trừ tiền?',
      answer:
        'Có thể do: Khách hàng khiếu nại về chất lượng giao hàng, giao hàng trễ quá 30 phút, hủy đơn sau khi đã lấy hàng. Kiểm tra chi tiết trong mục Lịch sử giao dịch.',
    },
    {
      id: 9,
      category: 'other',
      question: 'Làm sao để nâng cao đánh giá của tôi?',
      answer:
        'Giao hàng đúng giờ, thái độ lịch sự, cẩn thận với hàng hóa, giữ liên lạc với khách hàng, chụp ảnh bằng chứng rõ ràng.',
    },
    {
      id: 10,
      category: 'other',
      question: 'Tôi gặp sự cố trên đường, phải làm sao?',
      answer:
        'Liên hệ ngay tổng đài hỗ trợ 1900xxxx. Nếu gặp tai nạn, ưu tiên an toàn cá nhân, sau đó liên hệ công ty để được hỗ trợ.',
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCall = () => {
    Linking.openURL('tel:1900xxxx');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@bookstore.com');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ giúp</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={selectedCategory === cat.id ? '#E24A4A' : '#666'}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat.id && styles.categoryButtonTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Câu hỏi thường gặp</Text>
          {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {filteredFAQs.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>Không tìm thấy câu hỏi phù hợp</Text>
            </View>
          )}
        </View>

        {/* Quick Guide */}
        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>Hướng dẫn nhanh</Text>
          
          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="rocket-outline" size={24} color="#2196F3" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideItemTitle}>Bắt đầu giao hàng</Text>
              <Text style={styles.guideItemText}>
                Hướng dẫn chi tiết cho người mới
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideItemTitle}>Tối ưu thu nhập</Text>
              <Text style={styles.guideItemText}>
                Mẹo để kiếm nhiều tiền hơn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#FF9800" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideItemTitle}>An toàn giao hàng</Text>
              <Text style={styles.guideItemText}>
                Lưu ý khi giao hàng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Vẫn cần hỗ trợ?</Text>
          <Text style={styles.contactSubtitle}>
            Liên hệ với chúng tôi qua các kênh sau:
          </Text>

          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color="#fff" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Hotline hỗ trợ</Text>
              <Text style={styles.contactValue}>1900 xxxx (Miễn phí)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <View style={[styles.contactIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="mail" size={24} color="#fff" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email hỗ trợ</Text>
              <Text style={styles.contactValue}>support@bookstore.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <View style={[styles.contactIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Chat trực tuyến</Text>
              <Text style={styles.contactValue}>8:00 - 22:00 hàng ngày</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Điều khoản sử dụng</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Quy định shipper</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  categoriesContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E24A4A',
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#E24A4A',
  },
  faqContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 15,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#f8f8f8',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  guideContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 15,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  guideContent: {
    flex: 1,
  },
  guideItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideItemText: {
    fontSize: 13,
    color: '#666',
  },
  contactContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E24A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  legalContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 10,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalText: {
    fontSize: 14,
    color: '#666',
  },
});
