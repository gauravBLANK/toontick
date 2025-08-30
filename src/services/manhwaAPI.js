// AniList GraphQL API configuration
const ANILIST_API_URL = 'https://graphql.anilist.co'

// Rate limiting
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500 // 0.5 seconds between requests

// Mock data for fallback when API is unavailable
const MOCK_MANHWA_DATA = [
  {
    id: 105398,
    title: { english: "Solo Leveling", romaji: "Na Honjaman Level Up" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx105398-b673Vt5ZSuz3.jpg" },
    averageScore: 85,
    popularity: 253168,
    chapters: 201,
    status: "FINISHED",
    startDate: { year: 2018 },
    genres: ["Action", "Adventure", "Fantasy"]
  },
  {
    id: 119257,
    title: { english: "Omniscient Reader", romaji: "Jeonjijeok Dokja Sijeom" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx119257-Pi21aq3ey9GG.jpg" },
    averageScore: 86,
    popularity: 107243,
    chapters: null,
    status: "RELEASING",
    startDate: { year: 2020 },
    genres: ["Action", "Adventure", "Drama", "Fantasy"]
  },
  {
    id: 86964,
    title: { english: "Bastard", romaji: "Hurejasik" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/nx86964-r7S3IbJNr4SD.jpg" },
    averageScore: 83,
    popularity: 69264,
    chapters: 94,
    status: "FINISHED",
    startDate: { year: 2014 },
    genres: ["Drama", "Horror", "Psychological", "Thriller"]
  },
  {
    id: 100568,
    title: { english: "The Horizon", romaji: "Supyeongseon" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx100568-4BC0PsdwU4bL.png" },
    averageScore: 85,
    popularity: 55903,
    chapters: 21,
    status: "FINISHED",
    startDate: { year: 2016 },
    genres: ["Drama", "Slice of Life"]
  },
  {
    id: 128067,
    title: { english: "SSS-Class Revival Hunter", romaji: "SSS-geup Jugeoya Saneun Hunter" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx128067-wnLBg6Cy1ncs.jpg" },
    averageScore: 82,
    popularity: 52399,
    chapters: null,
    status: "RELEASING",
    startDate: { year: 2020 },
    genres: ["Action", "Adventure", "Fantasy"]
  },
  {
    id: 100954,
    title: { english: "Sweet Home", romaji: "Sweet Home" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx100954-xY0Vw2sRRo8t.png" },
    averageScore: 81,
    popularity: 49010,
    chapters: 141,
    status: "FINISHED",
    startDate: { year: 2017 },
    genres: ["Action", "Drama", "Horror", "Supernatural", "Thriller"]
  },
  {
    id: 85141,
    title: { english: "The God of High School", romaji: "God of High School" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx85141-qHR957V3FVco.png" },
    averageScore: 76,
    popularity: 48963,
    chapters: 569,
    status: "FINISHED",
    startDate: { year: 2011 },
    genres: ["Action", "Adventure", "Comedy", "Supernatural"]
  },
  {
    id: 126297,
    title: { english: "Teenage Mercenary", romaji: "Iphagyongbyeong" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx126297-SPiM7QtUnJ4P.jpg" },
    averageScore: 80,
    popularity: 47370,
    chapters: null,
    status: "RELEASING",
    startDate: { year: 2020 },
    genres: ["Action", "Drama"]
  }
]

// GraphQL query for searching manhwa
const SEARCH_MANHWA_QUERY = `
  query ($search: String, $genres: [String], $sort: [MediaSort]) {
    Page(page: 1, perPage: 50) {
      media(
        search: $search, 
        type: MANGA, 
        countryOfOrigin: "KR", 
        sort: $sort, 
        isAdult: false, 
        genre_in: $genres,
        status_in: [FINISHED, RELEASING]
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          extraLarge
        }
        chapters
        status
        isAdult
        startDate {
          year
        }
        averageScore
        popularity
        genres
      }
    }
  }
`

// GraphQL query for getting popular manhwa
const GET_POPULAR_MANHWA_QUERY = `
  query ($page: Int) {
    Page(page: $page, perPage: 50) {
      media(type: MANGA, countryOfOrigin: "KR", sort: POPULARITY_DESC, status_in: [FINISHED, RELEASING], isAdult: false) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        popularity
        isAdult
        chapters
        status
        startDate {
          year
        }
      }
    }
  }
`

// GraphQL query for getting manhwa details
const GET_MANHWA_DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      title {
        romaji
        english
      }
      description(asHtml: false)
      coverImage {
        extraLarge
      }
      status
      format
      startDate {
        year
      }
      chapters
      averageScore
      genres
    }
  }
`

// Helper function to add delay between requests
const rateLimitDelay = async () => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  lastRequestTime = Date.now()
}

// Helper function to make GraphQL requests with rate limiting and fallback
const makeGraphQLRequest = async (query, variables = {}) => {
  try {
    // Rate limiting
    await rateLimitDelay()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMITED')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      throw new Error(data.errors[0].message || 'GraphQL query failed')
    }

    if (!data.data) {
      throw new Error('No data returned from API')
    }

    return data.data
  } catch (error) {
    console.error('GraphQL request failed:', error)
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT')
    } else if (error.message === 'RATE_LIMITED') {
      throw new Error('RATE_LIMITED')
    } else if (error.name === 'TypeError' || error.message.includes('Load failed')) {
      throw new Error('CORS_ERROR')
    } else if (error.message.includes('HTTP error')) {
      throw new Error('SERVER_ERROR')
    } else {
      throw error
    }
  }
}

// Helper function to normalize manhwa data
const normalizeManhwaData = (media) => {
  return {
    id: media.id,
    title: media.title.english || media.title.romaji,
    image: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium,
    status: media.status?.toLowerCase() || 'unknown',
    chapters: media.chapters || null, // Keep null for unknown chapter counts
    averageScore: media.averageScore,
    popularity: media.popularity,
    genres: media.genres || [],
    description: media.description,
    year: media.startDate?.year
  }
}

// Get popular manhwa list with dynamic page fetching and fast fallback
export const getManhwaList = async (startPage = 1, pageCount = 3) => {
  // Check if we should skip API and use mock data immediately
  const shouldUseMockData = localStorage.getItem('useMockData') === 'true'
  
  if (shouldUseMockData) {
    console.log('Using mock data (API previously failed)')
    return getMockManhwaData(startPage, pageCount)
  }

  try {
    // Try to fetch just the first page quickly to test API availability
    const testData = await makeGraphQLRequest(GET_POPULAR_MANHWA_QUERY, { page: startPage })
    
    if (!testData.Page || !testData.Page.media || testData.Page.media.length === 0) {
      throw new Error('No data returned')
    }

    // If first page works, fetch remaining pages
    const pages = Array.from({ length: pageCount }, (_, i) => startPage + i)
    const allManhwa = []
    
    // Add first page data
    allManhwa.push(...testData.Page.media.map(normalizeManhwaData))
    
    // Fetch remaining pages if needed
    for (let i = 1; i < pages.length; i++) {
      try {
        const data = await makeGraphQLRequest(GET_POPULAR_MANHWA_QUERY, { page: pages[i] })
        if (data.Page && data.Page.media && data.Page.media.length > 0) {
          allManhwa.push(...data.Page.media.map(normalizeManhwaData))
        }
      } catch (pageError) {
        console.warn(`Failed to fetch page ${pages[i]}, continuing with available data`)
        break
      }
    }
    
    return allManhwa
    
  } catch (error) {
    console.warn('API failed, switching to mock data:', error.message)
    
    // Mark to use mock data for future requests to avoid delays
    localStorage.setItem('useMockData', 'true')
    
    return getMockManhwaData(startPage, pageCount)
  }
}

// Helper function to get mock data with pagination
const getMockManhwaData = (startPage = 1, pageCount = 3) => {
  const itemsPerPage = 16 // More items per page for better UX
  const startIndex = (startPage - 1) * itemsPerPage
  const endIndex = startIndex + (pageCount * itemsPerPage)
  
  // Create expanded mock data
  const expandedMockData = []
  for (let i = 0; i < 100; i++) {
    const baseItem = MOCK_MANHWA_DATA[i % MOCK_MANHWA_DATA.length]
    expandedMockData.push({
      ...baseItem,
      id: baseItem.id + (i * 1000000), // Ensure unique IDs for demo mode detection
      title: {
        ...baseItem.title,
        english: `${baseItem.title.english}${i > 7 ? ` Vol. ${Math.floor(i/8) + 1}` : ''}`
      }
    })
  }
  
  return expandedMockData
    .slice(startIndex, endIndex)
    .map(normalizeManhwaData)
}

// Helper function to convert sort parameters to AniList format
const getSortParameters = (sortBy, sortOrder) => {
  const sortMap = {
    releaseDate: sortOrder === 'asc' ? 'START_DATE' : 'START_DATE_DESC',
    rating: sortOrder === 'asc' ? 'SCORE' : 'SCORE_DESC'
  }
  
  const sortValue = sortMap[sortBy] || 'POPULARITY_DESC'
  return [sortValue]
}

// Search for manhwa with fallback
export const searchManhwa = async (query, filters = {}) => {
  // Handle both old format (just genres array) and new format (filters object)
  let genres = []
  let yearRange = { from: 2000, to: new Date().getFullYear() }
  let sortBy = 'releaseDate'
  let sortOrder = 'desc'

  if (Array.isArray(filters)) {
    // Old format: just genres array
    genres = filters
  } else if (filters && typeof filters === 'object') {
    // New format: filters object
    genres = filters.genres || []
    yearRange = filters.yearRange || { from: 2000, to: new Date().getFullYear() }
    sortBy = filters.sortBy || 'releaseDate'
    sortOrder = filters.sortOrder || 'desc'
  }

  // If no search query and no filters, return empty
  if (!query.trim() && genres.length === 0) {
    return []
  }

  try {
    const variables = {}
    
    if (query.trim()) {
      variables.search = query
    }
    
    if (genres.length > 0) {
      variables.genres = genres
    }

    // Always include sort
    variables.sort = getSortParameters(sortBy, sortOrder)

    const data = await makeGraphQLRequest(SEARCH_MANHWA_QUERY, variables)
    let results = data.Page.media.map(normalizeManhwaData)
    
    // Apply year filtering client-side
    if (yearRange.from > 2000 || yearRange.to < new Date().getFullYear()) {
      results = results.filter(item => {
        if (!item.year) return true // Include items without year data
        return item.year >= yearRange.from && item.year <= yearRange.to
      })
    }

    return results
  } catch (error) {
    console.error('Failed to search manhwa:', error)
    
    // Fallback: search in mock data
    if (error.message === 'CORS_ERROR' || error.message === 'RATE_LIMITED') {
      console.warn('API unavailable for search, using mock data')
      
      let results = MOCK_MANHWA_DATA.map(normalizeManhwaData)
      
      // Apply search query filter
      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        results = results.filter(item => 
          item.title.toLowerCase().includes(searchTerm)
        )
      }
      
      // Apply genre filter
      if (genres.length > 0) {
        results = results.filter(item => 
          item.genres.some(genre => genres.includes(genre))
        )
      }
      
      // Apply year filter
      if (yearRange.from > 2000 || yearRange.to < new Date().getFullYear()) {
        results = results.filter(item => {
          if (!item.year) return true
          return item.year >= yearRange.from && item.year <= yearRange.to
        })
      }
      
      return results
    }
    
    throw new Error('Search failed. Please try again.')
  }
}

// Get manhwa details by ID
export const getManhwaById = async (id) => {
  try {
    const data = await makeGraphQLRequest(GET_MANHWA_DETAILS_QUERY, { id: parseInt(id) })
    return normalizeManhwaData(data.Media)
  } catch (error) {
    console.error('Failed to fetch manhwa details:', error)
    throw new Error('Failed to load manhwa details. Please try again.')
  }
}

// Reset API usage to try real API again
export const resetApiUsage = () => {
  localStorage.removeItem('useMockData')
  console.log('API usage reset - will try real API on next request')
}