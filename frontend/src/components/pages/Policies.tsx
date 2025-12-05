import React from 'react';

const Policies: React.FC = () => {
  return (
    <div dir="rtl" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            سياسة الحجز والإلغاء وسياسة الدخول والخروج
          </h1>
          <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
            نحرص في لامار بارك على تقديم تجربة سلسة وواضحة لعملائنا. فيما يلي السياسات المتعلقة بالحجز والإلغاء والدخول والخروج لكل من الشاليهات والفنادق.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cancellation & Modification - Chalets */}
          <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gold mb-4">
              أولاً: سياسة الإلغاء وتعديل الحجوزات (للشاليهات)
            </h2>
            <ul className="space-y-4 text-gray-800 leading-8 list-decimal pr-5">
              <li>
                قبل أكثر من (أربعة أيام) من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>قابل للتعديل ويمكن التعديل لتاريخ آخر بدون رسوم.</li>
                  <li>قابل للإلغاء برسوم قدرها 30٪ من قيمة الحجز.</li>
                </ul>
              </li>
              <li>
                قبل أقل من (أربعة أيام) من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>قابل للتعديل برسوم قدرها 30٪ من قيمة الحجز.</li>
                  <li>غير قابل للإلغاء.</li>
                </ul>
              </li>
              <li>
                قبل أقل من 24 ساعة من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>غير قابل للإلغاء أو التعديل.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Cancellation & Modification - Hotels */}
          <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gold mb-4">
              ثانياً: سياسة الإلغاء وتعديل الحجوزات (للفنادق)
            </h2>
            <ul className="space-y-4 text-gray-800 leading-8 list-decimal pr-5">
              <li>
                قبل أكثر من (أربعة أيام) من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>قابل للتعديل ويمكن التعديل لتاريخ آخر بدون رسوم.</li>
                  <li>قابل للإلغاء برسوم قدرها 30٪ من قيمة الحجز.</li>
                </ul>
              </li>
              <li>
                قبل أقل من (أربعة أيام) من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>قابل للتعديل برسوم قدرها 30٪ من قيمة الحجز.</li>
                  <li>غير قابل للإلغاء.</li>
                </ul>
              </li>
              <li>
                قبل أقل من 48 ساعة من تاريخ الحجز:
                <ul className="mt-2 list-disc pr-5 text-gray-700">
                  <li>غير قابل للإلغاء أو التعديل.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Check-in/out - Chalets */}
          <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gold mb-4">
              أولاً: سياسة الدخول والخروج (للشاليهات)
            </h2>
            <ul className="space-y-3 text-gray-800 leading-8 list-decimal pr-5">
              <li>يبدأ الوصول من الساعة 2:00 ظهراً.</li>
              <li>وقت الخروج عند الساعة 8:00 صباحاً.</li>
              <li>
                عند عدم الخروج عند الساعة 8:00 صباحاً يتم الخصم من العميل مبلغ 300 ريال قيمة المبيت وبحد أقصى إلى الساعة 11:00 ظهراً.
              </li>
              <li>
                توفير مبلغ 500 ريال تأمين مسترد يدفع عند الدخول ويسترد عند خروج العميل.
              </li>
            </ul>
          </section>

          {/* Check-in/out - Hotels */}
          <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gold mb-4">
              ثانياً: سياسة الدخول والخروج (للفنادق)
            </h2>
            <ul className="space-y-3 text-gray-800 leading-8 list-decimal pr-5">
              <li>يبدأ الوصول من الساعة 3:00 عصراً.</li>
              <li>وقت الخروج عند الساعة 2:30 اليوم الثاني.</li>
              <li>
                عند عدم الخروج عند الساعة 2:30 يتم الخصم من العميل مبلغ 100 ريال إلى 300 ريال قيمة التأخير بالخروج وبحد أقصى إلى الساعة 5:30.
              </li>
            </ul>
          </section>
        </div>

        {/* Notes */}
        <div className="mt-10 bg-gold bg-opacity-10 border border-gold rounded-xl p-6 text-gray-800">
          <p className="font-medium">
            في حال وجود أي استفسارات إضافية حول السياسات، يُرجى التواصل مع فريق خدمة العملاء.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Policies;


