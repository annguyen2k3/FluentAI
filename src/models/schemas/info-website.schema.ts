import { ObjectId } from 'mongodb'

interface InfoWebsiteType {
  _id?: ObjectId
  name: string
  description: string
  url_logo: string
  phone_number: string
  email: string
  address: string
  create_at?: Date
  update_at?: Date
}

export default class InfoWebsite {
  _id?: ObjectId
  name: string
  description: string
  url_logo: string
  phone_number: string
  email: string
  address: string
  create_at?: Date
  update_at?: Date

  constructor(infoWebsite: InfoWebsiteType) {
    this._id = infoWebsite._id || new ObjectId()
    this.name = infoWebsite.name
    this.description = infoWebsite.description
    this.url_logo = infoWebsite.url_logo
    this.phone_number = infoWebsite.phone_number
    this.email = infoWebsite.email
    this.address = infoWebsite.address
    this.create_at = infoWebsite.create_at || new Date()
    this.update_at = infoWebsite.update_at || new Date()
  }
}
