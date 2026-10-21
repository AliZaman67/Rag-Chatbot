import { supabase } from './supabase'

export async function listChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createChat(userId, title = 'New chat') {
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameChat(chatId, title) {
  const { error } = await supabase.from('chats').update({ title }).eq('id', chatId)
  if (error) throw error
}

export async function deleteChat(chatId) {
  const { error } = await supabase.from('chats').delete().eq('id', chatId)
  if (error) throw error
}

export async function listMessages(chatId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addMessage(chatId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, role, content })
    .select()
    .single()
  if (error) throw error
  return data
}
