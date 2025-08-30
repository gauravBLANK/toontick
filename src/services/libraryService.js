import { supabase } from '../config/supabase.js'

/**
 * Library Service
 * Manages user's manhwa library in Supabase
 */

/**
 * Normalize status to match database constraints
 * @param {string} status - Original status value
 * @returns {string} Normalized status value
 */
const normalizeStatus = (status) => {
  if (!status) return 'reading'
  
  const normalizedStatus = status.toLowerCase().replace(/[^a-z_]/g, '_')
  
  // Map common status variations to valid database values
  const statusMap = {
    'reading': 'reading',
    'completed': 'completed',
    'finished': 'completed',
    'complete': 'completed',
    'on_hold': 'on_hold',
    'onhold': 'on_hold',
    'paused': 'on_hold',
    'dropped': 'dropped',
    'plan_to_read': 'plan_to_read',
    'planning': 'plan_to_read',
    'planned': 'plan_to_read',
    'want_to_read': 'plan_to_read',
    'to_read': 'plan_to_read',
    'ptw': 'plan_to_read'
  }
  
  const result = statusMap[normalizedStatus] || 'reading'
  
  // Log status normalization for debugging
  if (status !== result) {
    console.log(`📋 Status normalized: "${status}" → "${result}"`)
  }
  
  return result
}

/**
 * Get user's library from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of manhwa items
 */
export const getUserLibrary = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('user_library')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      
      // Provide specific error messages
      if (error.code === '42P01') {
        throw new Error('Database table "user_library" does not exist. Please run the SQL migration in Supabase Dashboard.')
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Please check Row Level Security policies.')
      } else {
        throw new Error(`Database error: ${error.message}`)
      }
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user library:', error)
    
    // Re-throw with original message if it's already a custom error
    if (error.message.includes('Database table') || error.message.includes('Permission denied')) {
      throw error
    }
    
    throw new Error('Failed to fetch library')
  }
}

/**
 * Add manhwa to user's library
 * @param {string} userId - User ID
 * @param {Object} manhwaItem - Manhwa item to add
 * @returns {Promise<Object>} Added manhwa item
 */
export const addToLibrary = async (userId, manhwaItem) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!manhwaItem || !manhwaItem.id) {
      throw new Error('Valid manhwa item is required')
    }

    console.log('🔍 Checking if manhwa already exists:', {
      userId,
      manhwaId: manhwaItem.id,
      title: manhwaItem.title
    })

    // Check if already in library by ID
    const { data: existingById, error: checkByIdError } = await supabase
      .from('user_library')
      .select('id, title, manhwa_id')
      .eq('user_id', userId)
      .eq('manhwa_id', manhwaItem.id)
      .maybeSingle()

    if (checkByIdError) {
      console.error('Error checking for existing manhwa by ID:', checkByIdError)
      throw new Error('Failed to check if manhwa already exists')
    }

    if (existingById) {
      console.log('⚠️ Manhwa already exists in library (by ID):', existingById.title)
      throw new Error(`${manhwaItem.title} is already in your library`)
    }

    // Also check by title as fallback (in case different sources use different IDs)
    const { data: existingByTitle, error: checkByTitleError } = await supabase
      .from('user_library')
      .select('id, title, manhwa_id')
      .eq('user_id', userId)
      .ilike('title', manhwaItem.title.trim()) // Case-insensitive exact match

    if (checkByTitleError) {
      console.error('Error checking for existing manhwa by title:', checkByTitleError)
      // Don't throw error here, continue with ID-based check
    }

    if (existingByTitle && existingByTitle.length > 0) {
      const existing = existingByTitle[0]
      console.log('⚠️ Manhwa already exists in library (by title):', {
        existingTitle: existing.title,
        existingId: existing.manhwa_id,
        newTitle: manhwaItem.title,
        newId: manhwaItem.id
      })
      throw new Error(`"${manhwaItem.title}" is already in your library (possibly with different ID)`)
    }

    console.log('✅ Manhwa not in library, proceeding with add')



    // Add to library
    const libraryItem = {
      user_id: userId,
      manhwa_id: manhwaItem.id,
      title: manhwaItem.title,
      image: manhwaItem.image,
      status: normalizeStatus(manhwaItem.status),
      chapters: manhwaItem.chapters || 0,
      progress: manhwaItem.progress || 0,
      average_score: manhwaItem.averageScore,
      popularity: manhwaItem.popularity,
      year: manhwaItem.year,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📝 Adding to library with normalized data:', {
      title: libraryItem.title,
      status: libraryItem.status,
      originalStatus: manhwaItem.status
    })

    const { data, error } = await supabase
      .from('user_library')
      .insert([libraryItem])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      
      // Provide specific error messages for common issues
      if (error.code === '23514' && error.message.includes('status_check')) {
        throw new Error(`Invalid status value. Status must be one of: reading, completed, on_hold, dropped, plan_to_read. Received: ${manhwaItem.status}`)
      }
      
      // Handle duplicate key constraint violation
      if (error.code === '23505' && error.message.includes('user_library_user_id_manhwa_id_key')) {
        throw new Error(`${manhwaItem.title} is already in your library`)
      }
      
      throw error
    }

    return data
  } catch (error) {
    console.error('Error adding to library:', error)
    throw error
  }
}

/**
 * Remove manhwa from user's library
 * @param {string} userId - User ID
 * @param {string} manhwaId - Manhwa ID to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeFromLibrary = async (userId, manhwaId) => {
  try {
    if (!userId || !manhwaId) {
      throw new Error('User ID and manhwa ID are required')
    }

    const { error } = await supabase
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq('manhwa_id', manhwaId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error removing from library:', error)
    throw error
  }
}

/**
 * Update manhwa status in user's library
 * @param {string} userId - User ID
 * @param {string} manhwaId - Manhwa ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated manhwa item
 */
export const updateLibraryItem = async (userId, manhwaId, updates) => {
  try {
    if (!userId || !manhwaId) {
      throw new Error('User ID and manhwa ID are required')
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_library')
      .update(updateData)
      .eq('user_id', userId)
      .eq('manhwa_id', manhwaId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error updating library item:', error)
    throw error
  }
}

/**
 * Check if manhwa is in user's library
 * @param {string} userId - User ID
 * @param {string} manhwaId - Manhwa ID
 * @returns {Promise<boolean>} True if in library
 */
export const isInLibrary = async (userId, manhwaId) => {
  try {
    if (!userId || !manhwaId) {
      return false
    }

    const { data, error } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', userId)
      .eq('manhwa_id', manhwaId)
      .maybeSingle() // Use maybeSingle to avoid errors when not found

    if (error) {
      console.error('Error checking library status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking library status:', error)
    return false
  }
}

/**
 * Find and remove duplicate manhwa in user's library
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cleanup results
 */
export const cleanupDuplicates = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('🧹 Starting duplicate cleanup...')

    // Get all library items
    const library = await getUserLibrary(userId)
    
    if (library.length === 0) {
      return { duplicatesFound: 0, duplicatesRemoved: 0 }
    }

    // Group by title (case-insensitive)
    const titleGroups = {}
    library.forEach(item => {
      const normalizedTitle = item.title.toLowerCase().trim()
      if (!titleGroups[normalizedTitle]) {
        titleGroups[normalizedTitle] = []
      }
      titleGroups[normalizedTitle].push(item)
    })

    // Find duplicates
    const duplicates = []
    Object.entries(titleGroups).forEach(([title, items]) => {
      if (items.length > 1) {
        console.log(`🔍 Found ${items.length} copies of "${items[0].title}":`, items.map(i => ({ id: i.manhwa_id, created: i.created_at })))
        
        // Keep the oldest one (first created), mark others for deletion
        const sorted = items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        const toKeep = sorted[0]
        const toDelete = sorted.slice(1)
        
        duplicates.push(...toDelete)
        console.log(`📌 Keeping: ${toKeep.manhwa_id} (${toKeep.created_at})`)
        console.log(`🗑️ Deleting: ${toDelete.map(d => `${d.manhwa_id} (${d.created_at})`).join(', ')}`)
      }
    })

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found')
      return { duplicatesFound: 0, duplicatesRemoved: 0 }
    }

    console.log(`🧹 Removing ${duplicates.length} duplicate entries...`)

    // Remove duplicates
    let removedCount = 0
    for (const duplicate of duplicates) {
      try {
        const { error } = await supabase
          .from('user_library')
          .delete()
          .eq('user_id', userId)
          .eq('id', duplicate.id) // Use the database ID, not manhwa_id

        if (error) {
          console.error(`Failed to remove duplicate ${duplicate.title}:`, error)
        } else {
          removedCount++
          console.log(`✅ Removed duplicate: ${duplicate.title} (${duplicate.manhwa_id})`)
        }
      } catch (err) {
        console.error(`Error removing duplicate ${duplicate.title}:`, err)
      }
    }

    console.log(`🎉 Cleanup complete: ${removedCount}/${duplicates.length} duplicates removed`)

    return {
      duplicatesFound: duplicates.length,
      duplicatesRemoved: removedCount,
      details: duplicates.map(d => ({ title: d.title, manhwa_id: d.manhwa_id }))
    }

  } catch (error) {
    console.error('Error during duplicate cleanup:', error)
    throw error
  }
}

/**
 * Clear user's library (for logout)
 * This doesn't delete from database, just clears local state
 * @returns {void}
 */
export const clearLocalLibrary = () => {
  try {
    localStorage.removeItem('manhwaLibrary')
  } catch (error) {
    console.error('Error clearing local library:', error)
  }
}

/**
 * Migrate local library to Supabase
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Migrated items
 */
export const migrateLocalLibrary = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get local library
    const localLibrary = JSON.parse(localStorage.getItem('manhwaLibrary') || '[]')
    
    // Always try to get existing library first
    const existingLibrary = await getUserLibrary(userId)
    
    if (localLibrary.length === 0) {
      // No local data to migrate, just return existing library
      return existingLibrary
    }

    console.log('📦 Found local library items to migrate:', localLibrary.length)
    console.log('📊 Existing Supabase library items:', existingLibrary.length)

    const existingIds = new Set(existingLibrary.map(item => item.manhwa_id))

    // Filter out items that already exist
    const itemsToMigrate = localLibrary.filter(item => !existingIds.has(item.id))

    console.log('🔄 Items to migrate after filtering:', itemsToMigrate.length)

    if (itemsToMigrate.length === 0) {
      // Clear local storage since everything is already in Supabase
      console.log('✅ All local items already exist in Supabase, clearing localStorage')
      clearLocalLibrary()
      return existingLibrary
    }

    // Use the centralized normalizeStatus function

    // Prepare items for insertion
    const libraryItems = itemsToMigrate.map(item => ({
      user_id: userId,
      manhwa_id: item.id,
      title: item.title,
      image: item.image,
      status: normalizeStatus(item.status),
      chapters: item.chapters || 0,
      progress: item.progress || 0,
      average_score: item.averageScore,
      popularity: item.popularity,
      year: item.year,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    console.log('📝 Inserting items:', libraryItems.map(item => item.title))

    // Insert items with upsert to handle any remaining duplicates
    const { data, error } = await supabase
      .from('user_library')
      .upsert(libraryItems, { 
        onConflict: 'user_id,manhwa_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Migration error:', error)
      // If it's a duplicate key error, try to continue with existing data
      if (error.code === '23505') {
        console.log('⚠️ Duplicate key error during migration, using existing library')
        clearLocalLibrary()
        return existingLibrary
      }
      throw error
    }

    console.log('✅ Migration successful, inserted:', data?.length || 0, 'items')

    // Clear local storage after successful migration
    clearLocalLibrary()

    // Return combined library
    return [...existingLibrary, ...(data || [])]
  } catch (error) {
    console.error('Error migrating local library:', error)
    
    // If migration fails, try to just return existing library and clear localStorage
    if (error.message.includes('duplicate key') || error.code === '23505') {
      console.log('🔧 Handling duplicate key error by clearing localStorage and using existing data')
      clearLocalLibrary()
      try {
        return await getUserLibrary(userId)
      } catch (fallbackError) {
        console.error('Fallback getUserLibrary failed:', fallbackError)
        return []
      }
    }
    
    throw error
  }
}