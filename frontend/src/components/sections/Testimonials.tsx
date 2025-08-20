import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'محمد العبدالله',
      location: 'الرياض',
      rating: 5,
      comment: 'تجربة رائعة مع لمار بارك! الفندق كان أكثر من المتوقع والخدمة كانت متميزة جداً. بالتأكيد سأحجز مرة أخرى.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      name: 'فاطمة السعيد',
      location: 'جدة',
      rating: 5,
      comment: 'الشاليه كان مثالي لقضاء عطلة نهاية الأسبوع مع العائلة. المكان نظيف جداً والإطلالة خيالية. شكراً لمار بارك على هذه التجربة الجميلة.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      name: 'أحمد الخالد',
      location: 'الدمام',
      rating: 5,
      comment: 'خدمة عملاء ممتازة وسرعة في الاستجابة. المنتجع كان بمستوى عالي جداً والأسعار معقولة. أنصح الجميع بالتعامل مع لمار بارك.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اقرأ تجارب عملائنا الحقيقية واكتشف لماذا يثقون في لمار بارك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gray-50 p-8 rounded-xl relative group hover:shadow-lg transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-gold opacity-50 mb-4" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Star key={index} className="h-5 w-5 text-gold fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed font-medium">
                "{testimonial.comment}"
              </p>

              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ml-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">هل تريد مشاركة تجربتك معنا؟</p>
          <button className="btn-gold">
            اكتب تقييمك
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;