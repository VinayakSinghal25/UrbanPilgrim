const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  displayTitle: { type: String, required: true },
  detailedTitle: { type: String, required: true },
  subheading: { type: String },
  description: { type: String, required: true },
});

const dayScheduleSchema = new mongoose.Schema({
  dayTitle: { type: String, required: true },
  activities: [activitySchema]
});

const pilgrimExperienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{
    public_id: String,
    url: String
  }],
  about: [{ heading: String, paragraphs: [String] }], // Optional, for other about sections
  retreatGuideBio: { type: String, required: true }, // Main paragraph
  retreatGuideLink: { type: String, required: true }, // "Meet your guide" link
  retreatGuideImage: { type: String }, // Optional: guide's image
  whatToExpect: { type: String },
  programSchedule: [dayScheduleSchema],
  priceSingle: { type: Number, required: true },
  priceCouple: { type: Number, required: true },
  location: { type: String },
  address: { type: String }, // New field: Address paragraph
  mapLink: { type: String }, // New field: Google Maps location link
  availableDates: [{
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  }],
  whatsIncluded: [{ type: String }], // Array of strings
  whatsNotIncluded: [{ type: String }], // Array of strings
  termsAndConditions: [{ type: String, required: true }],
  trainerProfileLink: { type: String }, // Optional: direct link to trainer's profile
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  occupancyOptions: {
    type: [String],
    enum: ['Single', 'Couple'],
    default: ['Single']
  }
});

module.exports = mongoose.model('PilgrimExperience', pilgrimExperienceSchema);