namespace BookStore.Infrastructure.Data.Seeders
{

    public static class PermissionConstants
    {
        // Book Management Permissions
        public const string BookView = "Book.View";
        public const string BookCreate = "Book.Create";
        public const string BookUpdate = "Book.Update";
        public const string BookDelete = "Book.Delete";

        // Category Management Permissions
        public const string CategoryView = "Category.View";
        public const string CategoryCreate = "Category.Create";
        public const string CategoryUpdate = "Category.Update";
        public const string CategoryDelete = "Category.Delete";

        // Author Management Permissions
        public const string AuthorView = "Author.View";
        public const string AuthorCreate = "Author.Create";
        public const string AuthorUpdate = "Author.Update";
        public const string AuthorDelete = "Author.Delete";

        // Order Management Permissions
        public const string OrderView = "Order.View";
        public const string OrderViewAll = "Order.ViewAll";
        public const string OrderCreate = "Order.Create";
        public const string OrderUpdate = "Order.Update";
        public const string OrderCancel = "Order.Cancel";
        public const string OrderDelete = "Order.Delete";

        // User Management Permissions
        public const string UserView = "User.View";
        public const string UserViewAll = "User.ViewAll";
        public const string UserCreate = "User.Create";
        public const string UserUpdate = "User.Update";
        public const string UserDelete = "User.Delete";
        public const string UserUpdateProfile = "User.UpdateProfile";

        // Role Management Permissions
        public const string RoleView = "Role.View";
        public const string RoleCreate = "Role.Create";
        public const string RoleUpdate = "Role.Update";
        public const string RoleDelete = "Role.Delete";
        public const string RoleAssignPermission = "Role.AssignPermission";

        // Inventory Management Permissions
        public const string InventoryView = "Inventory.View";
        public const string InventoryUpdate = "Inventory.Update";
        public const string InventoryImport = "Inventory.Import";
        public const string InventoryExport = "Inventory.Export";

        // Pricing & Discount Permissions
        public const string PriceView = "Price.View";
        public const string PriceUpdate = "Price.Update";
        public const string DiscountView = "Discount.View";
        public const string DiscountCreate = "Discount.Create";
        public const string DiscountUpdate = "Discount.Update";
        public const string DiscountDelete = "Discount.Delete";

        // Shipping Permissions
        public const string ShipmentView = "Shipment.View";
        public const string ShipmentViewAll = "Shipment.ViewAll";
        public const string ShipmentCreate = "Shipment.Create";
        public const string ShipmentUpdate = "Shipment.Update";
        public const string ShipmentAssignShipper = "Shipment.AssignShipper";
        public const string ShipmentUpdateStatus = "Shipment.UpdateStatus";

        // Review Permissions
        public const string ReviewView = "Review.View";
        public const string ReviewCreate = "Review.Create";
        public const string ReviewUpdate = "Review.Update";
        public const string ReviewDelete = "Review.Delete";
        public const string ReviewModerate = "Review.Moderate";

        // Cart Permissions
        public const string CartView = "Cart.View";
        public const string CartAddItem = "Cart.AddItem";
        public const string CartRemoveItem = "Cart.RemoveItem";
        public const string CartUpdateItem = "Cart.UpdateItem";
        public const string CartClear = "Cart.Clear";

        // Rental Permissions
        public const string RentalView = "Rental.View";
        public const string RentalCreate = "Rental.Create";
        public const string RentalReturn = "Rental.Return";
        public const string RentalExtend = "Rental.Extend";

        // Payment Permissions
        public const string PaymentView = "Payment.View";
        public const string PaymentViewAll = "Payment.ViewAll";
        public const string PaymentProcess = "Payment.Process";
        public const string PaymentRefund = "Payment.Refund";

        // Report & Analytics Permissions
        public const string ReportView = "Report.View";
        public const string ReportExport = "Report.Export";
        public const string AnalyticsView = "Analytics.View";

        // System Permissions
        public const string SystemViewLogs = "System.ViewLogs";
        public const string SystemManageSettings = "System.ManageSettings";
        public const string SystemManageNotifications = "System.ManageNotifications";
        
        // Publisher Management Permissions
        public const string PublisherView = "Publisher.View";
        public const string PublisherCreate = "Publisher.Create";
        public const string PublisherUpdate = "Publisher.Update";
        public const string PublisherDelete = "Publisher.Delete";
        
        // Warehouse Management Permissions
        public const string WarehouseView = "Warehouse.View";
        public const string WarehouseCreate = "Warehouse.Create";
        public const string WarehouseUpdate = "Warehouse.Update";
        public const string WarehouseDelete = "Warehouse.Delete";
        
        // Coupon Management Permissions
        public const string CouponView = "Coupon.View";
        public const string CouponCreate = "Coupon.Create";
        public const string CouponUpdate = "Coupon.Update";
        public const string CouponDelete = "Coupon.Delete";
        
        // Notification Permissions
        public const string NotificationView = "Notification.View";
        public const string NotificationCreate = "Notification.Create";
        public const string NotificationSend = "Notification.Send";
        public const string NotificationDelete = "Notification.Delete";
    }


    public static class RoleConstants
    {
        public const string Admin = "Admin";
        public const string User = "User";
        public const string Shipper = "Shipper";
    }
}