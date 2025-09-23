import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/common/PrivateRoute';
import Toast from './components/common/Toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Chalets from './components/pages/Chalets';
import Hotels from './components/pages/Hotels';
import Resorts from './components/pages/Resorts';
import PropertyDetails from './components/pages/PropertyDetails';
import HotelDetails from './components/pages/HotelDetails';
import Booking from './components/pages/Booking';
import Checkout from './components/pages/Checkout';
import BookingSuccess from './components/pages/BookingSuccess';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import UserDashboard from './components/pages/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProperties from './components/admin/AdminProperties';
import AdminBookings from './components/admin/AdminBookings';
import AdminPayments from './components/admin/AdminPayments';
import AdminUsers from './components/admin/AdminUsers';
import AdminSettings from './components/admin/AdminSettings';
import AdminAccountManagement from './components/admin/AdminAccountManagement';
import AdminPricing from './components/admin/AdminPricing';
import AdminHotels from './components/admin/AdminHotels';
import RoomBooking from './components/pages/RoomBooking';
import Payment from './components/pages/Payment';
import PaymentResponse from './components/pages/PaymentResponse';
import PaymentTest from './components/pages/PaymentTest';
import NotFound from './components/pages/NotFound';
import Policies from './components/pages/Policies';

// مكون لإجبار الصفحة على البدء من الأعلى
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
	return (
		<ErrorBoundary>
			<Router>
				<ScrollToTop />
				<div className="min-h-screen bg-gray-50 flex flex-col">
					<Toast />
					<Navbar />
					<main className="flex-1">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/chalets" element={<Chalets />} />
                            <Route path="/hotels" element={<Hotels />} />
                            <Route path="/resorts" element={<Resorts />} />
                            <Route path="/hotel/:id" element={<HotelDetails />} />
                            <Route path="/resort/:id" element={<HotelDetails />} />
							<Route path="/property/:id" element={<PropertyDetails />} />
							<Route path="/booking/:id" element={<Booking />} />
							<Route path="/checkout/:id" element={<Checkout />} />
							<Route path="/booking/success" element={<BookingSuccess />} />
							<Route path="/payment" element={<Payment />} />
							<Route path="/payment/response" element={<PaymentResponse />} />
							<Route path="/payment/test" element={<PaymentTest />} />
							<Route path="/about" element={<About />} />
							<Route path="/contact" element={<Contact />} />
							<Route path="/policies" element={<Policies />} />
							<Route path="/room-booking" element={<RoomBooking />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							
							{/* User Dashboard */}
							<Route path="/dashboard" element={
								<PrivateRoute requiredRole="customer">
									<UserDashboard />
								</PrivateRoute>
							} />
							
							{/* المسارات المحمية للإدارة */}
							<Route path="/admin" element={
								<PrivateRoute requiredRole="admin">
									<AdminDashboard />
								</PrivateRoute>
							} />
							<Route path="/admin/properties" element={
								<PrivateRoute requiredRole="admin">
									<AdminProperties />
								</PrivateRoute>
							} />
							<Route path="/admin/bookings" element={
								<PrivateRoute requiredRole="admin">
									<AdminBookings />
								</PrivateRoute>
							} />
							<Route path="/admin/payments" element={
								<PrivateRoute requiredRole="admin">
									<AdminPayments />
								</PrivateRoute>
							} />
							<Route path="/admin/users" element={
								<PrivateRoute requiredRole="admin">
									<AdminUsers />
								</PrivateRoute>
							} />
							<Route path="/admin/accounts" element={
								<PrivateRoute requiredRole="admin">
									<AdminAccountManagement />
								</PrivateRoute>
							} />
							<Route path="/admin/pricing" element={
								<PrivateRoute requiredRole="admin">
									<AdminPricing />
								</PrivateRoute>
							} />
							<Route path="/admin/settings" element={
								<PrivateRoute requiredRole="admin">
									<AdminSettings />
								</PrivateRoute>
							} />
							<Route path="/admin/hotels" element={
								<PrivateRoute requiredRole="admin">
									<AdminHotels />
								</PrivateRoute>
							} />
							
							{/* 404 Page */}
							{/* <Route path="*" element={<NotFound />} /> */}
						</Routes>
					</main>
					<Footer />
				</div>
			</Router>
		</ErrorBoundary>
	);
}

export default App;