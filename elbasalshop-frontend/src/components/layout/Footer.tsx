import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-nile text-primary-foreground mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {/* 👇 استبدال حرف "ب" بالصورة بنفس إعدادات النافبار */}
              <div className="relative flex items-center justify-center w-10 h-10">
                <img 
                  src="/logo.png" 
                  alt="شعار البصال" 
                  className="w-10 h-10 object-contain rounded-xl shadow-md bg-white/10 transition-transform hover:scale-[1.2] scale-[1.0]" 
                />
              </div>
              <div>
                {/* 👇 تحديث الاسم هنا أيضاً */}
                <h3 className="font-bold text-lg">البصال فون</h3>
                <p className="text-xs text-primary-foreground/70">موبايلات وإكسسوارات</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              أفضل متجر للموبايلات والإكسسوارات في رشيد. نوفر لك أحدث الهواتف الذكية وجميع ملحقاتها بأفضل الأسعار وضمان حقيقي.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">روابط سريعة</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                الرئيسية
              </Link>
              <Link to="/shop" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                المتجر
              </Link>
              <Link to="/shop?category=mobiles" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                موبايلات
              </Link>
              <Link to="/shop?category=accessories" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                إكسسوارات
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">تواصل معنا</h4>
            <div className="space-y-3">
              <a
                href="tel:+201234567890"
                className="flex items-center gap-3 text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>01234567890</span>
              </a>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>رشيد، محافظة البحيرة، مصر</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Clock className="w-4 h-4" />
                <span>يومياً من 10 صباحاً - 11 مساءً</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">تابعنا</h4>
            <div className="flex items-center gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-primary-foreground/60">
              تابعنا على السوشيال ميديا لمعرفة آخر العروض والوافدين الجدد
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} البصال فون - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
