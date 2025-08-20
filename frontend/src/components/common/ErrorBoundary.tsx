import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // يمكن إرسال الخطأ إلى خدمة مراقبة الأخطاء هنا
    // مثل Sentry أو LogRocket
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                حدث خطأ غير متوقع
              </h1>
            <p className="text-gray-600 mb-6">
                عذراً، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">تفاصيل الخطأ (Development):</h3>
                  <p className="text-red-700 text-sm mb-2">{this.state.error.message}</p>
                  <details className="text-red-700 text-xs">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </details>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
            <button
              onClick={this.handleReload}
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
            >
                <RefreshCw className="h-5 w-5 ml-2" />
                إعادة تحميل الصفحة
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
              >
                <Home className="h-5 w-5 ml-2" />
                العودة للصفحة الرئيسية
            </button>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني</p>
              <a 
                href="mailto:support@lamarpark.sa?subject=خطأ%20في%20التطبيق" 
                className="text-gold hover:underline"
              >
                support@lamarpark.sa
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;