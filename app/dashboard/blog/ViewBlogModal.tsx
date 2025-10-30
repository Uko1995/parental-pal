// "use client";

// // import { useState, useEffect } from "react";
// import {
//   XMarkIcon,
//   EyeIcon,
//   CalendarIcon,
//   UserIcon,
//   TagIcon,
//   ClockIcon,
// } from "@heroicons/react/24/outline";
// import { PostInterface } from "./page";

// interface ViewBlogModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   post: PostInterface | null;
// }

// export default function ViewBlogModal({
//   isOpen,
//   onClose,
//   post,
// }: ViewBlogModalProps) {
//   // const [loading, setLoading] = useState(false);

//   if (!isOpen || !post) return null;

//   const formatDate = (date: Date | string | undefined) => {
//     if (!date) return "Not set";
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getStatusBadge = (status: string) => {
//     const statusClasses = {
//       published: "badge-success",
//       draft: "badge-warning",
//       archived: "badge-neutral",
//     };

//     return (
//       <div
//         className={`badge badge-sm ${
//           statusClasses[status as keyof typeof statusClasses] || "badge-ghost"
//         }`}
//       >
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </div>
//     );
//   };

//   const getCategoryBadge = (category: string) => {
//     return <div className="badge badge-outline badge-sm">{category}</div>;
//   };

//   return (
//     <div className="modal modal-open">
//       <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <EyeIcon className="w-6 h-6 text-primary" />
//             <h3 className="font-bold text-xl">Blog Post Details</h3>
//           </div>
//           <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
//             <XMarkIcon className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Post Content */}
//         <div className="space-y-6">
//           {/* Title and Status */}
//           <div className="space-y-3">
//             <div className="flex items-start justify-between gap-4">
//               <h1 className="text-2xl font-bold text-gray-900 leading-tight">
//                 {post.title}
//               </h1>
//               <div className="flex gap-2">
//                 {getStatusBadge(post.status)}
//                 {post.isFeatured && (
//                   <div className="badge badge-primary badge-sm">Featured</div>
//                 )}
//                 {post.isPopular && (
//                   <div className="badge badge-secondary badge-sm">Popular</div>
//                 )}
//               </div>
//             </div>

//             {post.excerpt && (
//               <p className="text-gray-600 text-lg leading-relaxed">
//                 {post.excerpt}
//               </p>
//             )}
//           </div>

//           {/* Meta Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
//             <div className="flex items-center gap-2">
//               <UserIcon className="w-5 h-5 text-gray-500" />
//               <div>
//                 <span className="text-sm text-gray-500">Author</span>
//                 <p className="font-medium">{post.authorName}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <CalendarIcon className="w-5 h-5 text-gray-500" />
//               <div>
//                 <span className="text-sm text-gray-500">Created</span>
//                 <p className="font-medium">{formatDate(post.createdAt)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <TagIcon className="w-5 h-5 text-gray-500" />
//               <div>
//                 <span className="text-sm text-gray-500">Category</span>
//                 <div className="mt-1">{getCategoryBadge(post.category)}</div>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <ClockIcon className="w-5 h-5 text-gray-500" />
//               <div>
//                 <span className="text-sm text-gray-500">Read Time</span>
//                 <p className="font-medium">{post.readTime} min</p>
//               </div>
//             </div>

//             {post.publishedAt && (
//               <div className="flex items-center gap-2">
//                 <CalendarIcon className="w-5 h-5 text-gray-500" />
//                 <div>
//                   <span className="text-sm text-gray-500">Published</span>
//                   <p className="font-medium">{formatDate(post.publishedAt)}</p>
//                 </div>
//               </div>
//             )}

//             {post.scheduledFor && (
//               <div className="flex items-center gap-2">
//                 <CalendarIcon className="w-5 h-5 text-gray-500" />
//                 <div>
//                   <span className="text-sm text-gray-500">Scheduled For</span>
//                   <p className="font-medium">{formatDate(post.scheduledFor)}</p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Tags */}
//           {post.tags && post.tags.length > 0 && (
//             <div>
//               <h4 className="font-semibold mb-2">Tags</h4>
//               <div className="flex flex-wrap gap-2">
//                 {post.tags.map((tag, index) => (
//                   <div key={index} className="badge badge-outline badge-sm">
//                     {tag}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Keywords */}
//           {post.keywords && post.keywords.length > 0 && (
//             <div>
//               <h4 className="font-semibold mb-2">SEO Keywords</h4>
//               <div className="flex flex-wrap gap-2">
//                 {post.keywords.map((keyword, index) => (
//                   <div key={index} className="badge badge-neutral badge-sm">
//                     {keyword}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Related Services */}
//           {post.relatedServices && post.relatedServices.length > 0 && (
//             <div>
//               <h4 className="font-semibold mb-2">Related Services</h4>
//               <div className="flex flex-wrap gap-2">
//                 {post.relatedServices.map((service, index) => (
//                   <div
//                     key={index}
//                     className="badge badge-primary badge-outline badge-sm"
//                   >
//                     {service.charAt(0).toUpperCase() +
//                       service.slice(1).replace("-", " ")}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Target Age Group */}
//           {post.targetAgeGroup &&
//             (post.targetAgeGroup.min || post.targetAgeGroup.max) && (
//               <div>
//                 <h4 className="font-semibold mb-2">Target Age Group</h4>
//                 <p className="text-gray-600">
//                   {post.targetAgeGroup.min && post.targetAgeGroup.max
//                     ? `${post.targetAgeGroup.min} - ${post.targetAgeGroup.max} years`
//                     : post.targetAgeGroup.min
//                     ? `${post.targetAgeGroup.min}+ years`
//                     : `Up to ${post.targetAgeGroup.max} years`}
//                 </p>
//               </div>
//             )}

//           {/* SEO Metadata */}
//           {(post.metaTitle || post.metaDescription) && (
//             <div className="p-4 bg-base-200 rounded-lg">
//               <h4 className="font-semibold mb-3">SEO Metadata</h4>
//               <div className="space-y-3">
//                 {post.metaTitle && (
//                   <div>
//                     <label className="text-sm text-gray-500 font-medium">
//                       Meta Title
//                     </label>
//                     <p className="text-gray-900">{post.metaTitle}</p>
//                   </div>
//                 )}
//                 {post.metaDescription && (
//                   <div>
//                     <label className="text-sm text-gray-500 font-medium">
//                       Meta Description
//                     </label>
//                     <p className="text-gray-900">{post.metaDescription}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Author Bio */}
//           {post.authorBio && (
//             <div>
//               <h4 className="font-semibold mb-2">Author Bio</h4>
//               <p className="text-gray-600 leading-relaxed">{post.authorBio}</p>
//             </div>
//           )}

//           {/* Content */}
//           <div>
//             <h4 className="font-semibold mb-3">Content</h4>
//             <div className="prose max-w-none bg-base-100 p-6 rounded-lg border">
//               <div
//                 className="text-gray-900 leading-relaxed"
//                 dangerouslySetInnerHTML={{ __html: post.content }}
//               />
//             </div>
//           </div>

//           {/* Engagement Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-base-200 rounded-lg">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-primary">{post.views}</p>
//               <p className="text-sm text-gray-500">Views</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-secondary">{post.likes}</p>
//               <p className="text-sm text-gray-500">Likes</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-accent">{post.shares}</p>
//               <p className="text-sm text-gray-500">Shares</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-info">
//                 {post.comments.length}
//               </p>
//               <p className="text-sm text-gray-500">Comments</p>
//             </div>
//           </div>

//           {/* Comments */}
//           {post.comments && post.comments.length > 0 && (
//             <div>
//               <h4 className="font-semibold mb-3">
//                 Comments ({post.comments.length})
//               </h4>
//               <div className="space-y-3 max-h-60 overflow-y-auto">
//                 {post.comments.map((comment, index) => (
//                   <div key={index} className="p-3 bg-base-100 rounded border">
//                     <div className="flex items-center justify-between mb-2">
//                       <p className="font-medium text-sm">
//                         {comment.authorName}
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs text-gray-500">
//                           {formatDate(comment.createdAt)}
//                         </span>
//                         <div
//                           className={`badge badge-xs ${
//                             comment.isApproved
//                               ? "badge-success"
//                               : "badge-warning"
//                           }`}
//                         >
//                           {comment.isApproved ? "Approved" : "Pending"}
//                         </div>
//                       </div>
//                     </div>
//                     <p className="text-sm text-gray-700">{comment.content}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="modal-action">
//           <button onClick={onClose} className="btn btn-outline">
//             Close
//           </button>
//         </div>
//       </div>
//       <div className="modal-backdrop" onClick={onClose}></div>
//     </div>
//   );
// }
