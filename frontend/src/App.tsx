import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { LoginPage } from "@/features/auth/login-page"
import { CustomersPage } from "@/features/customers/customers-page"
import { InventoryPage } from "@/features/inventory/inventory-page"
import { OrdersPage } from "@/features/orders/orders-page"
import { ProductsPage } from "@/features/products/products-page"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
