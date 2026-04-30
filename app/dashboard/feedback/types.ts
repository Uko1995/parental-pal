export interface FeedbackItem {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  childAgeRange: string;
  servicesInterested: string[];
  customService?: string;
  interestLevel: string;
  feedback?: string;
  consent: boolean;
  createdAt: string;
}
