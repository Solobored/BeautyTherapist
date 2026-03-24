'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const skinTypes = ['dry', 'oily', 'combination', 'normal', 'sensitive']
const concerns = [
  { id: 'acne', label: { es: 'Acne', en: 'Acne' } },
  { id: 'wrinkles', label: { es: 'Arrugas', en: 'Wrinkles' } },
  { id: 'dark-spots', label: { es: 'Manchas oscuras', en: 'Dark spots' } },
  { id: 'dryness', label: { es: 'Resequedad', en: 'Dryness' } },
  { id: 'oiliness', label: { es: 'Oleosidad', en: 'Oiliness' } },
  { id: 'sensitivity', label: { es: 'Sensibilidad', en: 'Sensitivity' } },
  { id: 'fine-lines', label: { es: 'Lineas finas', en: 'Fine lines' } },
  { id: 'dark-circles', label: { es: 'Ojeras', en: 'Dark circles' } },
  { id: 'hyperpigmentation', label: { es: 'Hiperpigmentacion', en: 'Hyperpigmentation' } },
  { id: 'redness', label: { es: 'Enrojecimiento', en: 'Redness' } },
]

export default function SettingsPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType, updateBuyerProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthday: ''
  })
  
  const [preferencesData, setPreferencesData] = useState({
    skinType: '',
    concerns: [] as string[]
  })
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/settings')
    }
  }, [isAuthenticated, userType, router])
  
  useEffect(() => {
    if (user?.type === 'buyer') {
      setProfileData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        birthday: user.birthday || ''
      })
      setPreferencesData({
        skinType: user.beautyPreferences.skinType,
        concerns: user.beautyPreferences.concerns
      })
    }
  }, [user])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    updateBuyerProfile({
      fullName: profileData.fullName,
      phone: profileData.phone || undefined,
      birthday: profileData.birthday || undefined
    })
    
    setSuccessMessage(language === 'es' ? 'Perfil actualizado!' : 'Profile updated!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setIsLoading(false)
  }
  
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    updateBuyerProfile({
      beautyPreferences: {
        skinType: preferencesData.skinType as typeof user.beautyPreferences.skinType,
        concerns: preferencesData.concerns
      }
    })
    
    setSuccessMessage(language === 'es' ? 'Preferencias actualizadas!' : 'Preferences updated!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setIsLoading(false)
  }
  
  const toggleConcern = (concernId: string) => {
    setPreferencesData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concernId)
        ? prev.concerns.filter(c => c !== concernId)
        : [...prev.concerns, concernId]
    }))
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}
            </Button>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
            {language === 'es' ? 'Configuracion' : 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'es' ? 'Administra tu perfil y preferencias' : 'Manage your profile and preferences'}
          </p>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
            {successMessage}
          </div>
        )}
        
        <div className="grid gap-6 max-w-2xl">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'es' ? 'Foto de Perfil' : 'Profile Photo'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user.profilePhoto ? (
                    <Image
                      src={user.profilePhoto}
                      alt={user.fullName}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl font-semibold text-primary">
                        {user.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'es' ? 'Informacion Personal' : 'Personal Information'}</CardTitle>
              <CardDescription>
                {language === 'es' ? 'Actualiza tu informacion de contacto' : 'Update your contact information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Nombre Completo' : 'Full Name'}</Label>
                  <Input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Correo Electronico' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-secondary"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'es' ? 'El correo no puede ser modificado' : 'Email cannot be changed'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Telefono' : 'Phone'}</Label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Fecha de Nacimiento' : 'Birthday'}</Label>
                    <Input
                      type="date"
                      value={profileData.birthday}
                      onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Beauty Preferences */}
          <Card id="preferences">
            <CardHeader>
              <CardTitle>{language === 'es' ? 'Preferencias de Belleza' : 'Beauty Preferences'}</CardTitle>
              <CardDescription>
                {language === 'es' 
                  ? 'Ayudanos a recomendarte productos personalizados' 
                  : 'Help us recommend personalized products'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Tipo de Piel' : 'Skin Type'}</Label>
                  <Select
                    value={preferencesData.skinType}
                    onValueChange={(value) => setPreferencesData({ ...preferencesData, skinType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'es' ? 'Seleccionar' : 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {skinTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>{language === 'es' ? 'Preocupaciones de la Piel' : 'Skin Concerns'}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {concerns.map((concern) => (
                      <div key={concern.id} className="flex items-center gap-2">
                        <Checkbox
                          id={concern.id}
                          checked={preferencesData.concerns.includes(concern.id)}
                          onCheckedChange={() => toggleConcern(concern.id)}
                        />
                        <Label htmlFor={concern.id} className="cursor-pointer text-sm">
                          {concern.label[language]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {language === 'es' ? 'Guardar Preferencias' : 'Save Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'es' ? 'Cambiar Contrasena' : 'Change Password'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Contrasena Actual' : 'Current Password'}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Nueva Contrasena' : 'New Password'}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Confirmar Contrasena' : 'Confirm Password'}</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button type="submit">
                  {language === 'es' ? 'Actualizar Contrasena' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
