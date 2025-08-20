import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // تخصيص الإعدادات الافتراضية
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontFamily: 'Cairo, sans-serif',
          direction: 'rtl',
          textAlign: 'right'
        },
        
        // إعدادات مخصصة لكل نوع
        success: {
          duration: 3000,
          style: {
            background: '#10B981',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#EF4444',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: '#D4AF37',
          },
        },
      }}
    />
  );
};

export default Toast;