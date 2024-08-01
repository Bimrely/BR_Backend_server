import mongoose, { Schema } from 'mongoose';

const jobApiSchema = new Schema({
  job_id: String,
  job_title: String,
  employer_name: String,
  employer_logo: String,
  job_city: String,
  job_country: String,
  job_posted_at_datetime_utc: Date,
  job_max_salary: Number,
  job_publisher: String,
  job_employment_type: String,
  job_description: String,
  job_apply_link: String,
}, { timestamps: true });

export const JobApi = mongoose.model('JobApi', jobApiSchema);












