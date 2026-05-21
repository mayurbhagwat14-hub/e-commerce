import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl h-96 w-full flex flex-col p-4 justify-between">
      <div className="bg-slate-300 dark:bg-slate-700 h-48 rounded-xl w-full"></div>
      <div className="space-y-3 mt-4">
        <div className="bg-slate-300 dark:bg-slate-700 h-4 rounded w-3/4"></div>
        <div className="bg-slate-300 dark:bg-slate-700 h-3 rounded w-1/2"></div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <div className="bg-slate-300 dark:bg-slate-700 h-6 rounded w-1/4"></div>
        <div className="bg-slate-300 dark:bg-slate-700 h-8 rounded-lg w-1/3"></div>
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl p-6 space-y-4">
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-10 bg-slate-300 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 animate-pulse">
      <div className="h-[450px] bg-slate-300 dark:bg-slate-700 rounded-2xl w-full"></div>
      <div className="space-y-6">
        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-24 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-12 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};
