-- Add sample repair data for better chart visualization
INSERT INTO repairs (title, location, category, description, urgency, status, user_id, created_at, updated_at) VALUES
-- Electrical repairs
('Air conditioning not working', 'Room 101', 'hvac', 'AC unit in guest room not cooling properly. Temperature control panel shows error.', 'high', 'pending', 'admin-123', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('Light bulb replacement needed', 'Room 150', 'electrical', 'Main ceiling light in guest room is not working. Bulb needs replacement.', 'low', 'in_progress', 'admin-123', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
('Electrical outlet sparking', 'Room 310', 'electrical', 'Wall outlet near the bed is sparking when plugging in devices.', 'high', 'completed', 'admin-123', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
('TV remote not working', 'Room 180', 'electrical', 'Guest room TV remote control buttons are not responding.', 'low', 'pending', 'admin-123', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Plumbing repairs  
('Leaking bathroom faucet', 'Room 205', 'plumbing', 'Bathroom faucet has constant drip. Water pressure seems low.', 'medium', 'in_progress', 'admin-123', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('Toilet running constantly', 'Room 220', 'plumbing', 'Toilet keeps running after flushing. Water level seems high in tank.', 'medium', 'completed', 'admin-123', NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days'),

-- HVAC repairs
('Heating system malfunction', 'Room 305', 'hvac', 'Room heating not working properly. Temperature control shows error code.', 'high', 'in_progress', 'admin-123', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

-- Furniture repairs
('Broken chair in lobby', 'Main Lobby', 'furniture', 'One of the lobby chairs has a broken leg and is unstable.', 'low', 'pending', 'admin-123', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Other repairs
('Window blind stuck', 'Room 125', 'other', 'Window blinds in guest room are stuck and won''t open or close.', 'medium', 'completed', 'admin-123', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days'),
('Carpet stain removal needed', 'Room 175', 'other', 'Large stain on guest room carpet needs professional cleaning.', 'medium', 'pending', 'admin-123', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');