import { supabase } from '../config/supabase.js'

/**
 * Database Setup Checker
 * Run this to diagnose library setup issues
 */

export const checkDatabaseSetup = async () => {
  console.log('🔍 Checking database setup...')
  
  try {
    // 1. Check Supabase connection
    console.log('1. Testing Supabase connection...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Auth error:', userError)
      return false
    }
    
    if (!user) {
      console.log('⚠️ No authenticated user found')
      return false
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // 2. Check if user_library table exists
    console.log('2. Testing user_library table...')
    const { data: tableData, error: tableError } = await supabase
      .from('user_library')
      .select('*')
      .limit(1)
    
    if (tableError) {
      if (tableError.code === '42P01') {
        console.error('❌ Table "user_library" does not exist!')
        console.log('📋 You need to run the SQL migration in Supabase Dashboard')
        console.log('📋 Copy contents from supabase_migration.sql and run it in SQL Editor')
        return false
      } else {
        console.error('❌ Table error:', tableError)
        return false
      }
    }
    
    console.log('✅ Table exists and is accessible')
    
    // 3. Test RLS policies
    console.log('3. Testing Row Level Security policies...')
    const { data: rlsData, error: rlsError } = await supabase
      .from('user_library')
      .select('*')
      .eq('user_id', user.id)
    
    if (rlsError) {
      console.error('❌ RLS policy error:', rlsError)
      return false
    }
    
    console.log('✅ RLS policies working correctly')
    console.log('📊 Current library items:', rlsData.length)
    
    // 4. Test insert permissions
    console.log('4. Testing insert permissions...')
    const testItem = {
      user_id: user.id,
      manhwa_id: 'test-setup-check',
      title: 'Setup Test Item',
      status: 'reading',
      chapters: 0,
      progress: 0
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_library')
      .insert([testItem])
      .select()
    
    if (insertError) {
      console.error('❌ Insert permission error:', insertError)
      return false
    }
    
    console.log('✅ Insert permissions working')
    
    // 5. Clean up test item
    await supabase
      .from('user_library')
      .delete()
      .eq('manhwa_id', 'test-setup-check')
      .eq('user_id', user.id)
    
    console.log('✅ All checks passed! Database is properly set up.')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error during setup check:', error)
    return false
  }
}

/**
 * Quick fix for common issues
 */
export const quickFix = async () => {
  console.log('🔧 Attempting quick fixes...')
  
  try {
    // Clear any cached data
    localStorage.removeItem('manhwaLibrary')
    console.log('✅ Cleared local storage')
    
    // Refresh auth session
    const { error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('❌ Session refresh failed:', error)
    } else {
      console.log('✅ Session refreshed')
    }
    
    return true
  } catch (error) {
    console.error('❌ Quick fix failed:', error)
    return false
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.setupChecker = {
    checkDatabaseSetup,
    quickFix
  }
  
  console.log('🛠️ Setup checker loaded! Run these in console:')
  console.log('- window.setupChecker.checkDatabaseSetup()')
  console.log('- window.setupChecker.quickFix()')
}