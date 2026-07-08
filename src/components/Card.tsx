import { type ReactNode } from 'react'
import { cn } from '../lib/utils'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  titleExtra?: ReactNode
}

export default function Card({ children, title, className, titleExtra }: CardProps) {
  return (
    <div
      className={cn(
        'group bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-2xl flex-1 flex flex-col">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500 opacity-60" />
        <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
          {title && (
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{title}</h3>
              {titleExtra && <div className="shrink-0">{titleExtra}</div>}
            </div>
          )}
          <div className="flex-1 min-h-0 flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
