-- Insert test knowledge items
INSERT INTO knowledge_items (id, type, title, content, url, file_type, size, status) VALUES
  ('1', 'file', 'Kitchen Renovation Guide.pdf', 'Complete guide to kitchen renovation including cabinet installation, appliance selection, and budgeting tips.', NULL, 'pdf', 2400000, 'active'),
  ('2', 'link', 'Home Depot - Bathroom Tiles', NULL, 'https://www.homedepot.com/bathroom-tiles', NULL, NULL, 'active'),
  ('3', 'file', 'Electrical Wiring Basics.docx', 'Safety procedures and basic wiring techniques for home electrical work.', NULL, 'docx', 1800000, 'active'),
  ('4', 'context', 'Living Room Renovation Context', 'Planning to renovate a 15x20 living room with hardwood floors, budget of $15,000, modern farmhouse style preferred.', NULL, NULL, NULL, 'active'),
  ('5', 'link', 'DIY Plumbing Repairs', NULL, 'https://www.familyhandyman.com/plumbing-repairs', NULL, NULL, 'processing');

-- Insert tags
INSERT INTO tags (item_id, tag) VALUES
  ('1', 'kitchen'), ('1', 'renovation'), ('1', 'guide'),
  ('2', 'bathroom'), ('2', 'tiles'), ('2', 'materials'),
  ('3', 'electrical'), ('3', 'wiring'), ('3', 'safety'),
  ('4', 'living room'), ('4', 'budget'), ('4', 'farmhouse'),
  ('5', 'plumbing'), ('5', 'diy'), ('5', 'repairs');

-- Insert processing metadata
INSERT INTO processing_metadata (id, item_id, chunk_size, token_count, processing_time, sentiment, complexity) VALUES
  ('meta_1', '1', 750, 2500, 2300, 'positive', 'medium'),
  ('meta_2', '2', 500, 1200, 1500, 'neutral', 'low'),
  ('meta_3', '3', 800, 1800, 1900, 'neutral', 'high'),
  ('meta_4', '4', 600, 1000, 1200, 'positive', 'medium'),
  ('meta_5', '5', 650, 1500, 1700, 'neutral', 'medium');