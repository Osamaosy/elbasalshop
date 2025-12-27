import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    const success = await register(formData.name, formData.email, formData.password, formData.phone);
    
    if (success) {
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-nile rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">ب</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground mt-2">انضم لعائلة البصال شوب</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
              <div className="relative">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسمك"
                  className="pl-10"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <div className="relative">
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01xxxxxxxxx"
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive mt-1">كلمات المرور غير متطابقة</p>
              )}
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isLoading || formData.password !== formData.confirmPassword}
            >
              {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                سجل دخول
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
