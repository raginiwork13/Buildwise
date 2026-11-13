import React, { useState } from 'react';
import type { PortfolioProjectItem } from '../../types/profile';
import { Calendar, MapPin, Layers, ChevronRight, X } from 'lucide-react';

interface Props {
  project: PortfolioProjectItem;
}

export const PortfolioCard: React.FC<Props> = ({ project }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const images = project.media.filter((m) => m.media_type === 'image');
  const coverImage = images.length > 0 ? images[0].file_url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
        <div>
          {/* Cover & Gallery Preview */}
          <div className="relative h-48 bg-slate-100 overflow-hidden">
            <img
              src={coverImage}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => setModalOpen(true)}
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {project.project_type}
            </div>
            {project.completion_year && (
              <div className="absolute top-3 right-3 bg-white/90 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{project.completion_year}</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            <div>
              <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                {project.role}
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                {project.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
              {project.project_area_sqft && (
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.project_area_sqft.toLocaleString()} sq.ft</span>
                </div>
              )}
            </div>

            {project.indicative_budget && (
              <div className="bg-slate-50 p-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="text-slate-400">Project Budget:</span>
                <span className="font-bold text-slate-900">
                  ₹{(project.indicative_budget / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full Case Study ({project.media.length} photos)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Case Study Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Portfolio Case Study
                </span>
                <h3 className="text-lg font-bold">{project.title}</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {images.length > 0 && (
                <div>
                  <div className="h-72 rounded-2xl overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={images[activeImageIndex].file_url}
                      alt={images[activeImageIndex].caption || project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images[activeImageIndex].caption && (
                    <div className="text-xs text-slate-500 text-center italic">
                      {images[activeImageIndex].caption}
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
                            activeImageIndex === i ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={img.file_url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Project Overview</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Location</span>
                  <span className="font-bold text-slate-800">{project.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Role Handled</span>
                  <span className="font-bold text-slate-800">{project.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Area</span>
                  <span className="font-bold text-slate-800">{project.project_area_sqft || 'N/A'} sq.ft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
