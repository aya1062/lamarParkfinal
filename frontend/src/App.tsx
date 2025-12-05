import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/common/PrivateRoute';
import Toast from './components/common/Toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
const Chalets = React.lazy(() => import('./components/pages/Chalets'));
const Hotels = React.lazy(() => import('./components/pages/Hotels'));
const Resorts = React.lazy(() => import('./components/pages/Resorts'));
const PropertyDetails = React.lazy(() => import('./components/pages/PropertyDetails'));
const HotelDetails = React.lazy(() => import('./components/pages/HotelDetails'));
const RoomDetails = React.lazy(() => import('./components/pages/RoomDetails'));
const Booking = React.lazy(() => import('./components/pages/Booking'));
const Checkout = React.lazy(() => import('./components/pages/Checkout'));
const BookingSuccess = React.lazy(() => import('./components/pages/BookingSuccess'));
const About = React.lazy(() => import('./components/pages/About'));
const Contact = React.lazy(() => import('./components/pages/Contact'));
const Login = React.lazy(() => import('./components/pages/Login'));
const Register = React.lazy(() => import('./components/pages/Register'));
const UserDashboard = React.lazy(() => import('./components/pages/UserDashboard'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const AdminProperties = React.lazy(() => import('./components/admin/AdminProperties'));
const AdminBookings = React.lazy(() => import('./components/admin/AdminBookings'));
const AdminPayments = React.lazy(() => import('./components/admin/AdminPayments'));
const AdminUsers = React.lazy(() => import('./components/admin/AdminUsers'));
const AdminSettings = React.lazy(() => import('./components/admin/AdminSettings'));
const AdminAccountManagement = React.lazy(() => import('./components/admin/AdminAccountManagement'));
const AdminPricing = React.lazy(() => import('./components/admin/AdminPricing'));
const AdminHotels = React.lazy(() => import('./components/admin/AdminHotels'));
const AdminPartners = React.lazy(() => import('./components/admin/AdminPartners'));
const RoomBooking = React.lazy(() => import('./components/pages/RoomBooking'));
const PaymentSuccess = React.lazy(() => import('./components/pages/PaymentSuccess'));
const PaymentError = React.lazy(() => import('./components/pages/PaymentError'));
const NotFound = React.lazy(() => import('./components/pages/NotFound'));
const Policies = React.lazy(() => import('./components/pages/Policies'));

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
                    <Suspense fallback={<div style={{ display: 'none' }}>.</div>}>
                        <Routes>
							<Route path="/" element={<Home />} />
							<Route path="/chalets" element={<Chalets />} />
                            <Route path="/hotels" element={<Hotels />} />
                            <Route path="/resorts" element={<Resorts />} />
                            <Route path="/hotel/:id" element={<HotelDetails />} />
                            <Route path="/resort/:id" element={<HotelDetails />} />
                            <Route path="/room/:id" element={<RoomDetails />} />
							<Route path="/property/:id" element={<PropertyDetails />} />
							<Route path="/booking/:id" element={<Booking />} />
							<Route path="/checkout/:id" element={<Checkout />} />
							<Route path="/booking/success" element={<BookingSuccess />} />
							<Route path="/payment/success" element={<PaymentSuccess />} />
							<Route path="/payment/error" element={<PaymentError />} />
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
							<Route path="/admin/partners" element={
								<PrivateRoute requiredRole="admin">
									<AdminPartners />
								</PrivateRoute>
							} />
							
							{/* 404 Page */}
							{/* <Route path="*" element={<NotFound />} /> */}
                        </Routes>
                    </Suspense>
					</main>
					<Footer />
				</div>
			</Router>
		</ErrorBoundary>
	);
}

export default App;