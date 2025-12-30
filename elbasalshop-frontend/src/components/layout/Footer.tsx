import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Facebook, Instagram, MessageCircle, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-nile text-primary-foreground mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-10 h-10">
                <img 
                  src="/logo.png" 
                  alt="شعار البصال" 
                  className="w-10 h-10 object-contain rounded-xl shadow-md bg-white/10 transition-transform hover:scale-[1.2] scale-[1.0]" 
                />
              </div>
              <div>
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
                <span>واتساب المتجر</span>
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

        {/* Bottom Bar & Developer Info */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
          
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} البصال فون - جميع الحقوق محفوظة
          </p>

          {/* Developer Section */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="text-xs text-primary-foreground/70">
              تصميم وتطوير <span className="font-bold text-secondary">أسامة إبراهيم رزق</span>
            </span>
            
            <div className="flex items-center gap-3 border-r border-white/20 pr-3 mr-1">
              {/* GitHub */}
              <a 
                href="https://github.com/Osamaosy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/osama-rezk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-[#0077b5] transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              {/* WhatsApp Developer */}
              <a 
                href="https://wa.me/201277122289" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-[#25D366] transition-colors"
                title="Contact Developer"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;