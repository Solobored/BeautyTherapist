'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowLeft, Plus, Edit2, Trash2, Home, Briefcase, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useLanguage } from '@/contexts/language-context'
import { useAuth, type Address } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function AddressesPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType, addAddress, updateAddress, deleteAddress } = useAuth()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  })
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/addresses')
    }
  }, [isAuthenticated, userType, router])
  
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        label: editingAddress.label,
        fullName: editingAddress.fullName,
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        zipCode: editingAddress.zipCode,
        country: editingAddress.country,
        phone: editingAddress.phone,
        isDefault: editingAddress.isDefault
      })
    } else {
      setFormData({
        label: 'Home',
        fullName: user?.type === 'buyer' ? user.fullName : '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: user?.type === 'buyer' ? user.phone || '' : '',
        isDefault: false
      })
    }
  }, [editingAddress, user])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAddress) {
      updateAddress(editingAddress.id, formData)
    } else {
      addAddress(formData)
    }
    
    setIsDialogOpen(false)
    setEditingAddress(null)
  }
  
  const handleDelete = (id: string) => {
    if (confirm(language === 'es' ? 'Estas seguro de eliminar esta direccion?' : 'Are you sure you want to delete this address?')) {
      deleteAddress(id)
    }
  }
  
  const openEditDialog = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }
  
  const openNewDialog = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }
  
  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return Home
      case 'work': return Briefcase
      default: return MapPin
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {language === 'es' ? 'Mis Direcciones' : 'My Addresses'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'es' 
                  ? `${user.addresses.length} direcciones guardadas`
                  : `${user.addresses.length} saved addresses`}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Nueva Direccion' : 'New Address'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress 
                      ? (language === 'es' ? 'Editar Direccion' : 'Edit Address')
                      : (language === 'es' ? 'Nueva Direccion' : 'New Address')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Etiqueta' : 'Label'}</Label>
                    <Select
                      value={formData.label}
                      onValueChange={(value) => setFormData({ ...formData, label: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">{language === 'es' ? 'Casa' : 'Home'}</SelectItem>
                        <SelectItem value="Work">{language === 'es' ? 'Trabajo' : 'Work'}</SelectItem>
                        <SelectItem value="Other">{language === 'es' ? 'Otro' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Nombre Completo' : 'Full Name'}</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Direccion' : 'Street Address'}</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'es' ? 'Ciudad' : 'City'}</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'es' ? 'Estado' : 'State'}</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'es' ? 'Codigo Postal' : 'ZIP Code'}</Label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'es' ? 'Pais' : 'Country'}</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Telefono' : 'Phone'}</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      {language === 'es' ? 'Establecer como predeterminada' : 'Set as default'}
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {editingAddress
                      ? (language === 'es' ? 'Guardar Cambios' : 'Save Changes')
                      : (language === 'es' ? 'Agregar Direccion' : 'Add Address')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {user.addresses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'es' ? 'No tienes direcciones guardadas' : 'No saved addresses'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? 'Agrega una direccion para agilizar tus compras'
                  : 'Add an address to speed up your checkout'}
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Agregar Direccion' : 'Add Address'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {user.addresses.map((address) => {
              const LabelIcon = getLabelIcon(address.label)
              return (
                <Card key={address.id} className={`relative ${address.isDefault ? 'border-primary' : ''}`}>
                  {address.isDefault && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        {language === 'es' ? 'Predeterminada' : 'Default'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <LabelIcon className="w-4 h-4 text-primary" />
                      {address.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <p className="font-medium text-foreground">{address.fullName}</p>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                      <p>{address.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(address)}>
                        <Edit2 className="w-4 h-4 mr-1" />
                        {language === 'es' ? 'Editar' : 'Edit'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {language === 'es' ? 'Eliminar' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
