import { useState, useRef, useEffect } from 'react'

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Mecha', 'Music'
]

const GenreFilter = ({ selectedGenres = [], onGenreChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const handleGenreToggle = (genre) => {
    const newSelectedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre]
    
    onGenreChange(newSelectedGenres)
  }

  const clearAllGenres = () => {
    onGenreChange([])
  }

  const getDisplayText = () => {
    if (selectedGenres.length === 0) return 'All Genres'
    if (selectedGenres.length === 1) return selectedGenres[0]
    return `${selectedGenres.length} genres selected`
  }

  return (
    <div 
      className={className}
      ref={dropdownRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <label 
        htmlFor="genre-filter-button" 
        className="sr-only"
      >
        Filter by genre
      </label>
      
      <button
        id="genre-filter-button"
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Genre filter: ${getDisplayText()}`}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-color 0.2s ease',
          minHeight: '48px' // Ensure touch-friendly size
        }}
        onMouseEnter={(e) => e.target.style.borderColor = 'var(--border-hover)'}
        onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
      >
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          marginRight: '0.5rem'
        }}>
          {getDisplayText()}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        >
          <path d="M4.427 6.427a.75.75 0 011.06 0L8 8.94l2.513-2.513a.75.75 0 111.06 1.06l-3.043 3.044a.75.75 0 01-1.06 0L4.427 7.487a.75.75 0 010-1.06z" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Genre options"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '0.25rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* Clear all option */}
          {selectedGenres.length > 0 && (
            <>
              <button
                type="button"
                onClick={clearAllGenres}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Clear all genres
              </button>
            </>
          )}

          {/* Genre options */}
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre)
            return (
              <div
                key={genre}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleGenreToggle(genre)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleGenreToggle(genre)
                  }
                }}
                tabIndex={0}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: isSelected ? 'var(--bg-primary)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.target.style.backgroundColor = 'var(--bg-primary)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.target.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                    borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                      <path d="M8.5 2.5L4 7 1.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span>{genre}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Screen reader only text for selected genres */}
      <div 
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {selectedGenres.length > 0 
          ? `Selected genres: ${selectedGenres.join(', ')}`
          : 'No genres selected'
        }
      </div>
    </div>
  )
}

export default GenreFilter