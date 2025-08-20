import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
          <p className="text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-300"
          >
            <Home className="h-5 w-5 ml-2" />
            العودة للصفحة الرئيسية
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            العودة للصفحة السابقة
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا</p>
          <a 
            href="mailto:support@lamarpark.sa" 
            className="text-gold hover:underline"
          >
            support@lamarpark.sa
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 