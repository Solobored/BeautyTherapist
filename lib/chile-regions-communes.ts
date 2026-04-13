/**
 * Validación de regiones y comunas de Chile
 * Previne fraudes de envío: comprobador que la comuna coincida con la región seleccionada
 * Codes match CHILE_SHIPPING_REGIONS codes
 */

export interface ChileCommune {
  code: string
  name: string
  region: string
  regionCode: string
}

export const CHILE_REGIONS_COMMUNES: Record<string, { region: string; communes: string[] }> = {
  'tarapaca': {
    region: 'Región de Tarapacá',
    communes: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte']
  },
  'antofagasta': {
    region: 'Región de Antofagasta',
    communes: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla']
  },
  'atacama': {
    region: 'Región de Atacama',
    communes: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar']
  },
  'coquimbo': {
    region: 'Región de Coquimbo',
    communes: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paiguano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña']
  },
  'valparaiso': {
    region: 'Región de Valparaíso',
    communes: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Putaendo', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar']
  },
  'rm': {
    region: 'Región Metropolitana',
    communes: ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura']
  },
  'ohiggins': {
    region: 'Región del Libertador General Bernardo O\'Higgins',
    communes: ['Alcones', 'Angostura', 'Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Espinoza', 'Graneros', 'Guacarhue', 'La Estrella', 'Lagunillas', 'Las Cabras', 'Li Yen', 'Lolol', 'Loreto', 'Machalí', 'Malloa', 'Marchigüe', 'Mataquito', 'Olivar', 'Palmilla', 'Paredones', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Rancagua', 'Rauco', 'Requínoa', 'Rioverde', 'Romeral', 'San Clemente', 'San Fernando', 'San Francisco de Mostazal', 'San Vicente de Tagua Tagua', 'Santa Cruz', 'Santo Domingo', 'Quinta de Tilcoco', 'Termas de Cauquenes']
  },
  'maule': {
    region: 'Región del Maule',
    communes: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curepto', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelarco', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas']
  },
  'nuble': {
    region: 'Región de Ñuble',
    communes: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Trehuaco', 'Yungay']
  },
  'biobio': {
    region: 'Región del Bío Bío',
    communes: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel']
  },
  'araucania': {
    region: 'Región de La Araucanía',
    communes: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Curacautín', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Los Sauces', 'Nueva Imperial', 'Padre Hurtado', 'Perkinenco', 'Pitrufquén', 'Pucón', 'Puente Negra', 'Puertas', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Tolten', 'Traiguén', 'Traipuén', 'Vilcún', 'Villaguillén', 'Villarrica']
  },
  'los_rios': {
    region: 'Región de Los Ríos',
    communes: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Popayán', 'Río Bueno', 'Toratá', 'Valdivia', 'Vergara']
  },
  'los_lagos': {
    region: 'Región de Los Lagos',
    communes: ['Ancud', 'Calbuco', 'Chaiten', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Purranque', 'Puyehue', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Puerto Montt', 'Puerto Varas', 'Sassafrás']
  },
  'aysen': {
    region: 'Región de Aysén',
    communes: ['Aysén', 'Coyhaique', 'Guaitecas', 'La Junta', 'Lago General Carrera', 'Lago Vargas', 'Mañihuales', 'Marble', 'Pichidegua', 'Puerto Aysén', 'Reserva', 'Tortel', 'Villa Santa Lucia', 'Villa Santa Rosa de Tastil']
  },
  'magallanes': {
    region: 'Región de Magallanes',
    communes: ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Parvicella', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine']
  },
}

/** Crea un mapa invertido para búsqueda rápida: comuna → región */
export function buildCommuneToRegionMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [regionCode, { communes }] of Object.entries(CHILE_REGIONS_COMMUNES)) {
    for (const commune of communes) {
      map[commune.toLowerCase().trim()] = regionCode
    }
  }
  return map
}

/** Valida que una comuna pertenezca a la región especificada */
export function validateCommuneInRegion(commune: string, regionCode: string): boolean {
  if (!commune || !regionCode) return false
  
  const regionData = CHILE_REGIONS_COMMUNES[regionCode]
  if (!regionData) return false
  
  const communeNorm = commune.toLowerCase().trim()
  return regionData.communes.some(c => c.toLowerCase().trim() === communeNorm)
}

/** Obtiene la región para una comuna dada */
export function getRegionForCommune(commune: string): string | null {
  if (!commune) return null
  const map = buildCommuneToRegionMap()
  return map[commune.toLowerCase().trim()] || null
}

/** Lista todas las comunas de una región */
export function getCommunesForRegion(regionCode: string): string[] {
  return CHILE_REGIONS_COMMUNES[regionCode]?.communes || []
}

/** Obtiene todos los códigos de región disponibles */
export function getAllRegionCodes(): string[] {
  return Object.keys(CHILE_REGIONS_COMMUNES)
}

/** Normaliza códigos de región a minúsculas para comparación */
export function normalizeRegionCode(code: string): string {
  return code.toLowerCase().trim()
}
