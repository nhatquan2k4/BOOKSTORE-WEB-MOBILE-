import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isDefault: boolean;
}

export default function BankAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 1,
      bankName: 'Vietcombank',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN SHIPPER',
      branch: 'CN TP.HCM',
      isDefault: true,
    },
    {
      id: 2,
      bankName: 'Techcombank',
      accountNumber: '9876543210',
      accountName: 'NGUYEN VAN SHIPPER',
      branch: 'CN Quận 7',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: '',
  });

  const handleSetDefault = (id: number) => {
    setAccounts(accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id,
    })));
    Alert.alert('Thành công', 'Đã đặt làm tài khoản mặc định');
  };

  const handleDeleteAccount = (id: number) => {
    const account = accounts.find(acc => acc.id === id);
    if (account?.isDefault) {
      Alert.alert('Không thể xóa', 'Không thể xóa tài khoản mặc định. Vui lòng đặt tài khoản khác làm mặc định trước.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setAccounts(accounts.filter(acc => acc.id !== id));
          },
        },
      ]
    );
  };

  const handleAddAccount = () => {
    if (!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountName) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const account: BankAccount = {
      id: Date.now(),
      ...newAccount,
      isDefault: accounts.length === 0,
    };

    setAccounts([...accounts, account]);
    setNewAccount({ bankName: '', accountNumber: '', accountName: '', branch: '' });
    setShowAddModal(false);
    Alert.alert('Thành công', 'Đã thêm tài khoản ngân hàng');
  };

  const getBankLogo = (bankName: string) => {
    const colors: { [key: string]: string } = {
      Vietcombank: '#007852',
      Techcombank: '#E31E24',
      VietinBank: '#003F87',
      BIDV: '#005BAA',
      Agribank: '#00843D',
      ACB: '#005BAA',
      MB: '#004B9D',
      VPBank: '#1C4B9E',
    };
    return colors[bankName] || '#666';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color="#E24A4A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            Tài khoản ngân hàng dùng để nhận tiền rút từ ví shipper
          </Text>
        </View>

        {/* Bank Accounts List */}
        <View style={styles.accountsList}>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              {account.isDefault && (
                <View style={styles.defaultBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              )}

              <View style={styles.accountHeader}>
                <View
                  style={[
                    styles.bankLogo,
                    { backgroundColor: getBankLogo(account.bankName) },
                  ]}
                >
                  <Text style={styles.bankLogoText}>
                    {account.bankName.substring(0, 3).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  <Text style={styles.accountNumber}>
                    **** **** {account.accountNumber.slice(-4)}
                  </Text>
                </View>
              </View>

              <View style={styles.accountDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chủ tài khoản:</Text>
                  <Text style={styles.detailValue}>{account.accountName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chi nhánh:</Text>
                  <Text style={styles.detailValue}>{account.branch}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số TK đầy đủ:</Text>
                  <Text style={styles.detailValue}>{account.accountNumber}</Text>
                </View>
              </View>

              <View style={styles.accountActions}>
                {!account.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(account.id)}
                  >
                    <Ionicons name="star-outline" size={18} color="#FF9800" />
                    <Text style={styles.actionButtonText}>Đặt mặc định</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteAccount(account.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E24A4A" />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {accounts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có tài khoản ngân hàng</Text>
            <Text style={styles.emptySubtext}>
              Thêm tài khoản để nhận tiền rút từ ví
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Account Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm tài khoản ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên ngân hàng *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAccount.bankName}
                  onChangeText={(text) =>
                    setNewAccount({ ...newAccount, bankName: text })
                  }
                  placeholder="VD: Vietcombank, Techcombank..."
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số tài khoản *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAccount.accountNumber}
                  onChangeText={(text) =>
                    setNewAccount({ ...newAccount, accountNumber: text })
                  }
                  placeholder="Nhập số tài khoản"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên chủ tài khoản *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAccount.accountName}
                  onChangeText={(text) =>
                    setNewAccount({ ...newAccount, accountName: text.toUpperCase() })
                  }
                  placeholder="VD: NGUYEN VAN A"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Chi nhánh</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAccount.branch}
                  onChangeText={(text) =>
                    setNewAccount({ ...newAccount, branch: text })
                  }
                  placeholder="VD: CN TP.HCM"
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Thêm tài khoản</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  infoBanner: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
  },
  accountsList: {
    padding: 15,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLogoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
  },
  accountDetails: {
    gap: 10,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#E24A4A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E24A4A',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#E24A4A',
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
