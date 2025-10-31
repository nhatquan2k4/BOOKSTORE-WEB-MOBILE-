'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  LoadingSpinner,
  Alert,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Pagination,
  EmptyState,
} from '@/components/ui';

export default function ComponentsDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI Components Demo
          </h1>
          <p className="text-xl text-gray-600">
            Tất cả các components dùng chung trong dự án
          </p>
        </div>

        <div className="space-y-12">
          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Buttons</h2>
            <Card>
              <CardContent className="space-y-6">
                {/* Variants */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Variants:</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Sizes:</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">States:</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Inputs</h2>
            <Card>
              <CardContent className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  helperText="Mật khẩu tối thiểu 8 ký tự"
                />
                
                <Input
                  label="Error Example"
                  value="invalid@"
                  error="Email không hợp lệ"
                />
                
                <Input
                  label="With Icon"
                  placeholder="Tìm kiếm..."
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </CardContent>
            </Card>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hover>
                <CardHeader>
                  <CardTitle>Card with Header</CardTitle>
                  <CardDescription>This is a card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Card content goes here</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card padding="lg">
                <CardTitle className="mb-4">Large Padding</CardTitle>
                <p className="text-gray-600">This card has large padding</p>
              </Card>

              <Card hover padding="sm">
                <CardTitle className="mb-2">Hover Effect</CardTitle>
                <p className="text-gray-600 text-sm">Hover over this card</p>
              </Card>
            </div>
          </section>

          {/* Badges */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Badges</h2>
            <Card>
              <CardContent className="space-y-6">
                {/* Variants */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Variants:</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Sizes:</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Use Cases:</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="success">Đã thanh toán</Badge>
                    <Badge variant="warning">Đang xử lý</Badge>
                    <Badge variant="danger">Đã hủy</Badge>
                    <Badge variant="info">Mới</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Loading Spinner */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Loading Spinner</h2>
            <Card>
              <CardContent>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-gray-600 mt-2">Small</p>
                  </div>
                  <div className="text-center">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-gray-600 mt-2">Medium</p>
                  </div>
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-gray-600 mt-2">Large</p>
                  </div>
                  <div className="text-center">
                    <LoadingSpinner size="xl" />
                    <p className="text-sm text-gray-600 mt-2">Extra Large</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Alerts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Alerts</h2>
            <div className="space-y-4">
              {showAlert && (
                <Alert variant="info" onClose={() => setShowAlert(false)}>
                  <strong className="font-semibold">Info:</strong> This is an information alert with close button.
                </Alert>
              )}
              
              <Alert variant="success">
                <strong className="font-semibold">Success!</strong> Your order has been placed successfully.
              </Alert>
              
              <Alert variant="warning">
                <strong className="font-semibold">Warning:</strong> Your session will expire in 5 minutes.
              </Alert>
              
              <Alert variant="danger">
                <strong className="font-semibold">Error:</strong> Failed to process payment. Please try again.
              </Alert>
            </div>
          </section>

          {/* Modal */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Modal</h2>
            <Card>
              <CardContent>
                <Button onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Pagination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Pagination</h2>
            <Card>
              <CardContent>
                <Pagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
                <p className="text-center text-gray-600 mt-4">
                  Current Page: <strong>{currentPage}</strong>
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Empty State */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Empty State</h2>
            <Card>
              <EmptyState
                title="Giỏ hàng trống"
                description="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi!"
                action={{
                  label: 'Mua sắm ngay',
                  onClick: () => alert('Navigate to shop'),
                }}
              />
            </Card>
          </section>

          {/* Complex Example */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Complex Example</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng #ORDER123456</CardTitle>
                    <CardDescription>Đặt ngày 29/10/2025</CardDescription>
                  </div>
                  <Badge variant="success">Đã thanh toán</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-semibold">450,000₫</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">450,000₫</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Xem chi tiết
                </Button>
                <Button className="flex-1">
                  Mua lại
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>

      {/* Modal Demo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <ModalTitle>Xác nhận đặt hàng</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 mb-4">
            Bạn có chắc chắn muốn đặt hàng với tổng giá trị <strong>450,000₫</strong>?
          </p>
          <Alert variant="info">
            Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>
          <Button onClick={() => {
            alert('Đặt hàng thành công!');
            setIsModalOpen(false);
          }}>
            Xác nhận
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
