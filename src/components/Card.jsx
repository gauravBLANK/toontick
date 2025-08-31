import { useState } from 'react'
import Modal from './Modal'

const Card = ({ title, image, status, chapters, averageScore, popularity, year, progress, onRead, onStatusChange, buttonText = "Add to Library", cardType = "library" }) => {
  const [currentStatus, setCurrentStatus] = useState(status || 'reading')
  const [currentProgress, setCurrentProgress] = useState(progress || 0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const statusOptions = [
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'reading', label: 'Reading', color: 'var(--accent-color)' },
    { value: 'planned', label: 'Planned', color: '#8b5cf6' },
    { value: 'dropped', label: 'Dropped', color: '#ef4444' }
  ]

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status?.toLowerCase())
    return statusOption ? statusOption.color : 'var(--secondary-color)'
  }

  const formatStatus = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status?.toLowerCase())
    return statusOption ? statusOption.label : 'Reading'
  }

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus)
    setShowDropdown(false)
    
    // Auto-update progress based on status
    let newProgress = currentProgress
    if (newStatus === 'completed' && chapters) {
      newProgress = chapters
      setCurrentProgress(chapters)
    } else if (newStatus === 'planned' || newStatus === 'dropped') {
      newProgress = 0
      setCurrentProgress(0)
    }
    
    if (onStatusChange) {
      onStatusChange(newStatus, newProgress)
    }
  }

  // Featured Card Layout
  if (cardType === "featured") {
    return (
      <>
      <div className="featured-card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        gap: '0.75rem',
        minHeight: '180px',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
      >
        {/* Image Section */}
        <div className="card-image-container" style={{
          width: '120px',
          height: '160px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative'
        }}>
          {image ? (
            <img src={image} alt={title} style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)'
            }} />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span style={{ fontSize: '0.7rem', textAlign: 'center', opacity: 0.7 }}>No Cover</span>
            </div>
          )}
          

        </div>
        
        {/* Content Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Title and Type */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                MANHWA
              </span>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-secondary)'
              }} />
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase'
              }}>
                {year || 'Unknown'}
              </span>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <h3 className="card-title" style={{
                fontSize: '1.1rem',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)',
                lineHeight: '1.3',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {title}
              </h3>
            </button>
            
            {/* Rating and Popularity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.75rem'
            }}>
              {averageScore && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#fbbf24',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{(averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              
              {popularity && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#ef4444',
                  fontSize: '0.9rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{Math.floor(popularity / 1000)}k</span>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span>{chapters ? `${chapters} chapters` : 'Ongoing'}</span>
              </div>
            </div>
            

          </div>

          {/* Bottom Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1,
              minWidth: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Available</span>
              </div>
            </div>
            
            <button
              onClick={onRead}
              className="btn btn-primary add-to-library-btn"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
                minHeight: '36px',
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span className="btn-text-full">{buttonText}</span>
              <span className="btn-text-short">Add</span>
            </button>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
          {/* Image and Title Section */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '120px',
              height: '180px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}>
              {image ? (
                <img 
                  src={image} 
                  alt={title} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                lineHeight: '1.2'
              }}>
                {title}
              </h1>
              
              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.25rem 0.75rem',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Type:</span>
                <span style={{ color: 'var(--text-primary)' }}>MANHWA</span>
                
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Status:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {status ? formatStatus(status).toUpperCase() : 'ONGOING'}
                </span>
                
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Year:</span>
                <span style={{ color: 'var(--text-primary)' }}>{year || '2024'}</span>
              </div>
            </div>
          </div>
          
          {/* Synopsis Section */}
          <div>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem'
            }}>
              Synopsis
            </h2>
            <p style={{
              color: 'var(--text-primary)',
              lineHeight: '1.5',
              fontSize: '0.9rem',
              marginBottom: '0.75rem'
            }}>
              {title} follows an engaging story filled with adventure, drama, and compelling characters. 
              This manhwa explores themes of growth, friendship, and overcoming challenges in a beautifully 
              illustrated world. With its unique art style and captivating storyline, readers are drawn into 
              a narrative that combines action with emotional depth.
              {chapters && ` With ${chapters} chapters available, there's plenty of content to explore.`}
              {averageScore && ` Rated ${(averageScore / 10).toFixed(1)}/10 by readers.`}
            </p>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}>
              (Source: AniList)
            </p>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setIsModalOpen(false)
                if (onRead) onRead()
              }}
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              {buttonText}
            </button>
            
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.color = 'var(--text-primary)'
                e.target.style.borderColor = 'var(--text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'var(--text-secondary)'
                e.target.style.borderColor = 'var(--border-color)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
    )
  }

  // Library Card Layout (like the image you showed)
  return (
    <>
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: `2px solid ${getStatusColor(currentStatus)}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1rem',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      display: 'flex',
      gap: '1rem',
      minHeight: '180px',
      position: 'relative'
    }}>
      {/* Image Section */}
      <div style={{
        width: '140px',
        height: '160px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {image ? (
          <img src={image} alt={title} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)'
          }} />
        ) : (
          <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>No Image</span>
        )}
      </div>
      
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(currentStatus),
        border: '2px solid var(--bg-card)',
        zIndex: 1
      }} />
      
      {/* Content Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Title and Rating */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <h3 style={{
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              {title}
            </h3>
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {averageScore && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--accent-color)',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{(averageScore / 10).toFixed(1)}</span>
              </div>
            )}
            
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              Status: {formatStatus(currentStatus).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}>
              Progress
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={currentProgress.toString()}
                min="0"
                max={chapters || 999}
                onChange={(e) => {
                  let inputValue = e.target.value.trim()
                  
                  // Handle empty input
                  if (inputValue === '') {
                    setCurrentProgress(0)
                    return
                  }
                  
                  // Only allow numeric input
                  if (!/^\d+$/.test(inputValue)) {
                    return // Don't update if non-numeric
                  }
                  
                  // Remove leading zeros and convert to number
                  let newProgress = parseInt(inputValue, 10)
                  
                  // Handle invalid input (NaN)
                  if (isNaN(newProgress)) {
                    newProgress = 0
                  }
                  
                  // Ensure progress doesn't exceed total chapters (only for completed series)
                  if (chapters && newProgress > chapters) {
                    newProgress = chapters
                  }
                  
                  // Ensure progress is not negative
                  if (newProgress < 0) {
                    newProgress = 0
                  }
                  
                  setCurrentProgress(newProgress)
                  
                  // Auto-update status if progress reaches total chapters (only for completed series)
                  if (chapters && newProgress >= chapters && currentStatus !== 'completed') {
                    setCurrentStatus('completed')
                    if (onStatusChange) {
                      onStatusChange('completed', newProgress)
                    }
                  } else {
                    // Save progress change even if status doesn't change
                    if (onStatusChange) {
                      onStatusChange(currentStatus, newProgress)
                    }
                  }
                }}
                onFocus={(e) => {
                  // Select all text when focused for easy editing
                  e.target.select()
                }}
                onBlur={(e) => {
                  // Clean up the input on blur to remove any formatting issues
                  const cleanValue = parseInt(e.target.value, 10) || 0
                  setCurrentProgress(cleanValue)
                  
                  // Save the progress change to localStorage
                  if (onStatusChange) {
                    onStatusChange(currentStatus, cleanValue)
                  }
                }}
                style={{
                  width: '60px',
                  padding: '0.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                / {chapters || 'Ongoing'}
              </span>
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}>
              My Status
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDropdown(!showDropdown)
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}
              >
                {formatStatus(currentStatus)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 10,
                  marginTop: '0.25rem'
                }}>
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(option.value)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: 'none',
                        backgroundColor: currentStatus === option.value ? 'var(--bg-secondary)' : 'transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        if (currentStatus !== option.value) {
                          e.target.style.backgroundColor = 'var(--bg-secondary)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentStatus !== option.value) {
                          e.target.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '0.25rem'
      }}>
        <button
          onClick={onRead}
          style={{
            background: '#ef4444',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Remove from library"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
          {/* Image and Title Section */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '120px',
              height: '180px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}>
              {image ? (
                <img 
                  src={image} 
                  alt={title} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                lineHeight: '1.2'
              }}>
                {title}
              </h1>
              
              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.25rem 0.75rem',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Type:</span>
                <span style={{ color: 'var(--text-primary)' }}>MANHWA</span>
                
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Status:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {currentStatus ? formatStatus(currentStatus).toUpperCase() : 'ONGOING'}
                </span>
                
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Year:</span>
                <span style={{ color: 'var(--text-primary)' }}>{year || '2024'}</span>
              </div>
            </div>
          </div>
          
          {/* Synopsis Section */}
          <div>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem'
            }}>
              Synopsis
            </h2>
            <p style={{
              color: 'var(--text-primary)',
              lineHeight: '1.5',
              fontSize: '0.9rem',
              marginBottom: '0.75rem'
            }}>
              {title} follows an engaging story filled with adventure, drama, and compelling characters. 
              This manhwa explores themes of growth, friendship, and overcoming challenges in a beautifully 
              illustrated world. With its unique art style and captivating storyline, readers are drawn into 
              a narrative that combines action with emotional depth.
              {chapters && ` With ${chapters} chapters available, there's plenty of content to explore.`}
              {averageScore && ` Rated ${(averageScore / 10).toFixed(1)}/10 by readers.`}
            </p>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}>
              (Source: AniList)
            </p>
          </div>
          
          {/* Progress Information for Library Items */}
          {currentStatus && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem'
              }}>
                Your Progress
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(currentStatus)
                  }} />
                  <span style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {formatStatus(currentStatus)}
                  </span>
                </div>
                <span style={{
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {currentProgress} / {chapters || 'Ongoing'} chapters
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-color)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${chapters ? (currentProgress / chapters) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: getStatusColor(currentStatus),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.color = 'var(--text-primary)'
                e.target.style.borderColor = 'var(--text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'var(--text-secondary)'
                e.target.style.borderColor = 'var(--border-color)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  )
}

export default Card