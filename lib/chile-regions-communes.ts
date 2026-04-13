/**
 * Validación de regiones y comunas de Chile
 * Previne fraudes de envío: comprobador que la comuna coincida con la región seleccionada
 */

export interface ChileCommune {
  code: string
  name: string
  region: string
  regionCode: string
}

export const CHILE_REGIONS_COMMUNES: Record<string, { region: string; communes: string[] }> = {
  'I': {
    region: 'Región de Tarapacá',
    communes: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte']
  },
  'II': {
    region: 'Región de Antofagasta',
    communes: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla']
  },
  'III': {
    region: 'Región de Atacama',
    communes: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar']
  },
  'IV': {
    region: 'Región de Coquimbo',
    communes: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paiguano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña']
  },
  'V': {
    region: 'Región de Valparaíso',
    communes: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Putaendo', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar']
  },
  'rm': {
    region: 'Región Metropolitana de Santiago',
    communes: ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Longaví', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura']
  },
  'VI': {
    region: 'Región del Libertador Gral. Bernardo O\'Higgins',
    communes: ['Chimbarongo', 'Chépica', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'La Estrella', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchigüe', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'San Vicente', 'Santa Cruz']
  },
  'VII': {
    region: 'Región del Maule',
    communes: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curepto', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelarco', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas']
  },
  'XVI': {
    region: 'Región de Ñuble',
    communes: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Trehuaco', 'Yungay']
  },
  'VIII': {
    region: 'Región del Biobío',
    communes: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel']
  },
  'IX': {
    region: 'Región de La Araucanía',
    communes: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica']
  },
  'XIV': {
    region: 'Región de Los Ríos',
    communes: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia']
  },
  'X': {
    region: 'Región de Los Lagos',
    communes: ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Purranque', 'Puyehue', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo']
  },
  'XI': {
    region: 'Región Aysén del Gral. Carlos Ibáñez del Campo',
    communes: ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', 'O\'Higgins', 'Río Ibáñez', 'Tortel']
  },
  'XII': {
    region: 'Región de Magallanes y de la Antártica Chilena',
    communes: ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine']
  }
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
