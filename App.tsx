
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSheetData } from './services/googleSheets';
import { Student, ViewType } from './types';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import NotificationPanel from './components/NotificationPanel';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSheetData();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء تحميل البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // حساب التنبيهات
  const notifications = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiredIds: Student[] = [];
    const expiringSoonIds: Student[] = [];
    const unpaidFees: Student[] = [];

    students.forEach(s => {
      // 1. الرسوم
      if (s.fees !== 'نعم') {
        unpaidFees.push(s);
      }

      // 2. الهوية
      if (s.expiryId) {
        try {
          // محاولة تحويل التاريخ (نفترض تنسيق YYYY-MM-DD أو مشابه)
          const expiryDate = new Date(s.expiryId);
          if (!isNaN(expiryDate.getTime())) {
            if (expiryDate < now) {
              expiredIds.push(s);
            } else if (expiryDate <= thirtyDaysFromNow) {
              expiringSoonIds.push(s);
            }
          }
        } catch (e) {
          console.error("Invalid date format for student:", s.name);
        }
      }
    });

    return { expiredIds, expiringSoonIds, unpaidFees };
  }, [students]);

  const totalNotifications = notifications.expiredIds.length + 
                           notifications.expiringSoonIds.length + 
                           notifications.unpaidFees.length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تعذر تحميل البيانات</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={loadData}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
            >
              إعادة المحاولة
            </button>
            <p className="text-xs text-gray-400">تأكد من أن ملف جوجل شيت "عام" (Public) وأن الرابط صحيح.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-200">
                  🌙
                </div>
                <h1 className="text-xl font-black text-teal-800 hidden sm:block">نظام إدارة الحلقات</h1>
              </div>
              
              <div className="hidden md:flex gap-1">
                {[
                  { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
                  { id: 'table', label: 'قاعدة البيانات', icon: '📊' },
                  { id: 'add', label: 'إضافة دارس', icon: '➕' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ViewType)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      activeView === item.id 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-100' 
                      : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* زر التنبيهات المطور */}
               <div className="relative">
                 <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`p-2 rounded-xl transition-all relative ${isNotificationOpen ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-teal-600 hover:bg-gray-50'}`}
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {totalNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                        {totalNotifications}
                      </span>
                    )}
                 </button>

                 {isNotificationOpen && (
                   <NotificationPanel 
                    notifications={notifications} 
                    onClose={() => setIsNotificationOpen(false)} 
                   />
                 )}
               </div>

               <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-bold cursor-pointer">
                  أ
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-teal-700 font-bold animate-pulse">جاري تحميل البيانات من جوجل...</p>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                {activeView === 'dashboard' && 'نظرة عامة على البيانات'}
                {activeView === 'table' && 'قاعدة بيانات الدارسين'}
                {activeView === 'add' && 'إضافة دارس جديد'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeView === 'dashboard' && 'إحصائيات وتحليلات الحلقات لعام 2025'}
                {activeView === 'table' && 'إدارة واستعراض كافة بيانات الدارسين المسجلين'}
                {activeView === 'add' && 'تعبئة بيانات الدارس لإضافته لقاعدة البيانات'}
              </p>
            </header>

            {activeView === 'dashboard' && <Dashboard students={students} />}
            {activeView === 'table' && <StudentTable students={students} />}
            {activeView === 'add' && (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center gap-4">
                 <div className="text-6xl">🚧</div>
                 <h3 className="text-xl font-bold">نموذج الإضافة قيد التطوير</h3>
                 <p className="text-gray-500 max-w-md">سيتم ربط هذا النموذج بـ Google App Script لتحديث الجدول مباشرة.</p>
                 <button 
                  onClick={() => setActiveView('table')}
                  className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold"
                 >
                   العودة للقاعدة
                 </button>
              </div>
            )}
          </>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        {[
          { id: 'dashboard', label: 'إحصائيات', icon: '🏠' },
          { id: 'table', label: 'البيانات', icon: '📊' },
          { id: 'add', label: 'إضافة', icon: '➕' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`flex flex-col items-center gap-1 ${activeView === item.id ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
