/** 分段相机视角（矩形范围，西/南/东/北，单位：度） */
export interface SegmentView {
  west: number
  south: number
  east: number
  north: number
}

export type SegmentCategory =
  | 'overview'
  | 'source'
  | 'confluence'
  | 'wetland'
  | 'engineering'
  | 'landmark'
  | 'delta'

export interface Segment {
  id: string
  title: string
  subtitle: string
  category: SegmentCategory
  view: SegmentView
  description?: string
}

export type PoiCategory = 'city' | 'landmark' | 'engineering' | 'water'

export interface Poi {
  id: string
  name: string
  nameEn?: string
  category: PoiCategory
  lon: number
  lat: number
  description?: string
}
