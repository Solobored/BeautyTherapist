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
    communes: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Calera', 'Carahue', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'Curacaví', 'Getares', 'Hijuela', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'Limache', 'Llaillay', 'Nogales', 'Oliva', 'Olmué', 'Panquehue', 'Papudo', 'Puchuncaví', 'Putaendo', 'Quillota', 'Quintero', 'Reñaca', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Socoroma', 'Valparaíso', 'Vina del Mar', 'Zapallar']
  },
  'rm': {
    region: 'Región Metropolitana',
    communes: ['Aisén', 'Pirque', 'San José de Maipo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'Peñaflor', 'Isidro Pereira', 'Casablanca', 'El Quisco', 'El Tabo', 'Cartagena', 'Santo Domingo', 'Colina', 'Lampa', 'Renca', 'Pudahuel', 'Quilicura', 'Huechuraba', 'Maipú', 'Cerrillos', 'Estación Central', 'Quinta Normal', 'Santiago', 'San Joaquín', 'La Florida', 'Puente Alto', 'La Pintana', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Curacaví', 'San Pedro', 'Talagante', 'Peñaflor', 'Peñaflor', 'Linderos', 'Tiltil', 'Batuco', 'Llano de Maipo', 'Padre Hurtado', 'Pomaire', 'Requínoa']
  },
  'ohiggins': {
    region: 'Región del Libertador General Bernardo O\'Higgins',
    communes: ['Alcones', 'Angostura', 'Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Espinoza', 'Graneros', 'Guacarhue', 'La Estrella', 'Lagunillas', 'Las Cabras', 'Li Yen', 'Lolol', 'Loreto', 'Machalí', 'Malloa', 'Marchigüe', 'Mataquito', 'Olivar', 'Palmilla', 'Paredones', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Rancagua', 'Rauco', 'Requínoa', 'Rioverde', 'Romeral', 'San Clemente', 'San Fernando', 'San Francisco de Mostazal', 'San Vicente de Tagua Tagua', 'Santa Cruz', 'Santo Domingo', 'Quinta de Tilcoco', 'Termas de Cauquenes']
  },
  'maule': {
    region: 'Región del Maule',
    communes: ['Cauquenes', 'Chanco', 'Chillan', 'Chillán Viejo', 'Cholchol', 'Constitución', 'Curepto', 'Empedrado', 'Hualañé', 'Hualpén', 'Huerta del Maipo', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Nuble', 'Parral', 'Quirihue', 'Rauco', 'Retiro', 'San Clemente', 'San Javier', 'Sangarcía', 'Santa Juana', 'Talca', 'Tguaca', 'Tomé', 'Trabunco', 'Vilches', 'Yerbas Buenas']
  },
  'nuble': {
    region: 'Región de Ñuble',
    communes: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Quirihue', 'Ranquil', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco']
  },
  'biobio': {
    region: 'Región del Bío Bío',
    communes: ['Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Chillan', 'Concepción', 'Contulmo', 'Curanilahue', 'Floridablanca', 'Hualqui', 'Huépil', 'Laja', 'Lebu', 'Lota', 'Los Santos', 'Nacimiento', 'Negrete', 'Penco', 'Quilleco', 'Quirihue', 'Ranquil', 'San Pedro de la Paz', 'San Rosendo', 'Santa Barbara', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel']
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
