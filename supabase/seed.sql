-- IAF VIP Itineraries — sample data
-- Run AFTER schema.sql. Safe to re-run: wipes vips/events/invitations first
-- (keeps profiles / auth.users).

truncate table invitations, companions, vips, events restart identity cascade;

-- ============================================================
-- Events (IAF 2027: Feb 4–7, 2027 — sample schedule)
-- ============================================================
insert into events (name, description, event_date, start_time, end_time, venue, map_url, dress_code, capacity, invite_only, notes) values
  ('VIP Preview Day',                'Early access to galleries before the public open.',                                              '2027-02-04', '11:00', '17:00', 'NSIC Exhibition Grounds, Okhla',       'https://maps.google.com/?q=NSIC+Exhibition+Grounds+Okhla',                'Smart casual',     400, true, null),
  ('Opening Night Gala',             'Seated dinner with speeches by the IAF leadership team.',                                        '2027-02-04', '19:30', '23:00', 'The Taj Mahal Hotel, Mansingh Road',   'https://maps.google.com/?q=Taj+Mahal+Hotel+Mansingh+Road',                'Cocktail attire',  250, true, 'Speeches from Jaya Asokan at 20:30.'),
  ('Collectors Breakfast',           'A morning gathering for senior collectors and institutional patrons.',                            '2027-02-05', '08:30', '10:00', 'The Oberoi, Lodhi Road',               'https://maps.google.com/?q=The+Oberoi+Lodhi+Road+Delhi',                  'Smart casual',      60, true, 'Hosted by Jaya Asokan.'),
  ('Gallery Walk — Central Delhi',   'A curator-led walk through three of Delhi''s leading contemporary galleries.',                   '2027-02-05', '15:00', '18:00', 'Shrine Empire, Nature Morte, Vadehra', 'https://maps.google.com/?q=Shrine+Empire+Gallery+Delhi',                  'Casual',            30, true, 'Three galleries, curator-led.'),
  ('BMW Art Dinner',                 'A partner dinner celebrating the BMW × IAF commission.',                                          '2027-02-05', '20:00', '23:30', 'Bikaner House',                        'https://maps.google.com/?q=Bikaner+House+Delhi',                          'Black tie',        120, true, 'Seating plan locked 48h prior.'),
  ('Artist Talks — Women Collectors','Panel of leading women collectors in conversation with IAF curators.',                            '2027-02-06', '11:00', '12:30', 'Auditorium, NSIC',                     'https://maps.google.com/?q=NSIC+Exhibition+Grounds+Okhla',                'Casual',           150, false, null),
  ('Studio Visit — Subodh Gupta',    'Private studio visit with one of India''s most celebrated contemporary artists.',                '2027-02-06', '14:00', '16:00', 'Gurgaon studio',                       'https://maps.google.com/?q=Subodh+Gupta+studio+Gurgaon',                  'Casual',            20, true, 'Small group. Transport arranged.'),
  ('Institutional Dinner',           'A private dinner for museum directors and institutional patrons.',                                '2027-02-06', '20:00', '23:00', 'Bikaner House',                        'https://maps.google.com/?q=Bikaner+House+Delhi',                          'Cocktail attire',   80, true, 'Museum directors & patrons only.'),
  ('Closing Brunch',                 'A relaxed farewell brunch to close out the fair.',                                                 '2027-02-07', '11:00', '14:00', 'The Imperial, Janpath',                'https://maps.google.com/?q=The+Imperial+Janpath+Delhi',                   'Smart casual',     150, true, null),
  ('Press Roundtable',               'A small roundtable for accredited press, the day before the public open.',                         '2027-02-03', '16:00', '17:30', 'NSIC Media Lounge',                    'https://maps.google.com/?q=NSIC+Exhibition+Grounds+Okhla',                'Business casual',   40, true, 'Press only.');

-- ============================================================
-- VIPs (sample roster — mix of types, tiers + countries)
-- ============================================================
insert into vips
  (full_name, designation, email, phone, country, type, category, added_year, hotel, arrival_date, arrival_time, departure_date, departure_time, notes)
values
  ('Kiran Nadar',           'Founder, KNMA',                          'kiran@example.com',      '+91 98100 11111', 'india',         'collector',   'patrons',         2018, 'The Oberoi, Delhi',     null,         null,    null,         null,    'Always accompanied by curator.'),
  ('Uli Sigg',              'Collector & former Ambassador',          'uli@example.com',        '+41 44 000 0001', 'international', 'collector',   'patrons',         2019, 'The Imperial',          '2027-02-03', '23:50', '2027-02-08', '14:20', 'Major Chinese contemporary collection.'),
  ('Patrizia Sandretto',    'President, Fondazione Sandretto',        'patrizia@example.com',   '+39 011 000 001', 'international', 'institution', 'patrons',         2020, 'The Oberoi, Delhi',     '2027-02-03', '20:10', '2027-02-08', '10:00', null),
  ('Hans Ulrich Obrist',    'Artistic Director, Serpentine',          'huo@example.com',        '+44 20 0000 0001','international', 'curator',     'level_1',         2017, 'The Imperial',          '2027-02-03', '06:30', '2027-02-08', '13:00', 'Wants studio visits.'),
  ('Subodh Gupta',          'Artist',                                 'subodh@example.com',     '+91 98110 22222', 'india',         'artist',      'level_2',         2015, null,                    null,         null,    null,         null,    'Hosting studio visit on Feb 6.'),
  ('Bharti Kher',           'Artist',                                 'bharti@example.com',     '+91 98110 33333', 'india',         'artist',      'level_2',         2016, null,                    null,         null,    null,         null,    null),
  ('Thaddaeus Ropac',       'Founder, Galerie Thaddaeus Ropac',       'thaddaeus@example.com',  '+43 1 000 0001',  'international', 'exhibitor',   'level_1',         2021, 'The Taj Mahal Hotel',   '2027-02-03', '21:00', '2027-02-08', '10:30', 'Interested in Indian moderns.'),
  ('David Zwirner',         'Founder, David Zwirner',                 'david@example.com',      '+1 212 000 0001', 'international', 'exhibitor',   'level_1',         2022, 'The Oberoi, Delhi',     '2027-02-03', '09:15', '2027-02-08', '02:15', null),
  ('Nicholas Logsdail',     'Founder, Lisson Gallery',                'nick@example.com',       '+44 20 0000 0002','international', 'exhibitor',   'level_2',         2020, 'The Imperial',          '2027-02-03', '06:30', '2027-02-08', '13:00', null),
  ('Anita Dube',            'Artist',                                 'anita@example.com',      '+91 98110 44444', 'india',         'artist',      'level_3',         2018, null,                    null,         null,    null,         null,    null),
  ('Roobina Karode',        'Director, KNMA',                         'roobina@example.com',    '+91 98110 55555', 'india',         'curator',     'level_1',         2017, null,                    null,         null,    null,         null,    null),
  ('Maria Balshaw',         'Director, Tate',                         'maria@example.com',      '+44 20 0000 0003','international', 'institution', 'patrons',         2019, 'The Oberoi, Delhi',     '2027-02-03', '06:30', '2027-02-08', '13:00', null),
  ('Glenn Lowry',           'Director, MoMA',                         'glenn@example.com',      '+1 212 000 0002', 'international', 'institution', 'patrons',         2018, 'The Taj Mahal Hotel',   '2027-02-03', '09:15', '2027-02-08', '02:15', null),
  ('Suhanya Raffel',        'Director, M+',                           'suhanya@example.com',    '+852 3000 0001',  'international', 'institution', 'patrons',         2020, 'The Oberoi, Delhi',     '2027-02-03', '21:45', '2027-02-08', '00:30', null),
  ('Alia Al-Senussi',       'Collector & strategist',                 'alia@example.com',       '+44 20 0000 0004','international', 'collector',   'level_2',         2021, 'The Imperial',          '2027-02-03', '06:30', '2027-02-08', '13:00', null),
  ('Anna Schwartz',         'Founder, Anna Schwartz Gallery',         'anna@example.com',       '+61 3 0000 0001', 'international', 'exhibitor',   'level_3',         2022, 'The Oberoi, Delhi',     '2027-02-03', '19:30', '2027-02-08', '23:00', null),
  ('Rohit Bal',             'Designer',                               'rohit@example.com',      '+91 98110 66666', 'india',         'other',       'level_4',         2024, null,                    null,         null,    null,         null,    'Designer. VIP guest of sponsor.'),
  ('Sree Banerjee Goswami', 'Founder, Gallery Espace',                'sree@example.com',       '+91 98110 77777', 'india',         'exhibitor',   'level_2',         2017, null,                    null,         null,    null,         null,    null),
  ('Feroze Gujral',         'Founder, Outset India',                  'feroze@example.com',     '+91 98110 88888', 'india',         'collector',   'patrons',         2016, null,                    null,         null,    null,         null,    null),
  ('Adam Szymczyk',         'Curator',                                'adam@example.com',       '+41 61 000 0001', 'international', 'curator',     'level_2',         2023, 'The Imperial',          '2027-02-03', '23:50', '2027-02-08', '14:20', null),
  ('Shanay Jhaveri',        'Head of Visual Arts, Barbican',          'shanay@example.com',     '+1 212 000 0003', 'international', 'curator',     'level_1',         2020, 'The Oberoi, Delhi',     '2027-02-03', '09:15', '2027-02-08', '02:15', null),
  ('Vogue India',           'Press',                                  'press-vogue@example.com',null,              'india',         'press',       'level_4',         2024, null,                    null,         null,    null,         null,    'Press pass x 2.'),
  ('The Art Newspaper',     'Press',                                  'press-tan@example.com',  null,              'international', 'press',       'level_3',         2023, 'The Imperial',          '2027-02-03', '06:30', '2027-02-08', '13:00', 'Kabir Jhala + photographer.'),
  ('BMW India',             'Partner',                                'bmw@example.com',        '+91 124 000 0001','india',         'sponsor',     'level_1',         2022, null,                    null,         null,    null,         null,    'Partner. 10 guest slots at their dinner.'),
  ('Teiger Foundation',     'Foundation',                             'teiger@example.com',     '+1 212 000 0004', 'international', 'sponsor',     'level_2',         2024, 'The Oberoi, Delhi',     '2027-02-03', '09:15', '2027-02-08', '02:15', null),
  ('Aanya Kapoor',          'Young Collector',                        'aanya@example.com',      '+91 98110 99999', 'india',         'collector',   'young_collector', 2026, null,                    null,         null,    null,         null,    'IAF Young Collectors programme.');

-- Companions
insert into companions (vip_id, full_name, notes)
select id, 'Shiv Nadar',   'Spouse'      from vips where full_name = 'Kiran Nadar'
union all
select id, 'Rita Sigg',    'Spouse'      from vips where full_name = 'Uli Sigg'
union all
select id, 'Assistant TBC',null          from vips where full_name = 'Hans Ulrich Obrist'
union all
select id, 'Photographer', 'Press +1'    from vips where full_name = 'The Art Newspaper';

-- ============================================================
-- Invitations
-- list_number reflects priority cohort: 1 = first wave, 2 = second wave...
-- ============================================================

-- Opening Night Gala + Closing Brunch — patrons go to List 1, others List 2
with v as (select id, full_name, category from vips),
     e as (select id, name from events where name in ('Opening Night Gala','Closing Brunch'))
insert into invitations (vip_id, event_id, list_number, status, companions_attending)
select v.id, e.id,
  case when v.category = 'patrons' then 1
       when v.category in ('level_1','level_2') then 2
       else 3 end,
  case
    when v.full_name in ('Kiran Nadar','Uli Sigg','Hans Ulrich Obrist','Maria Balshaw','Glenn Lowry','Suhanya Raffel','Patrizia Sandretto','Thaddaeus Ropac','David Zwirner','Alia Al-Senussi') then 'accepted'::rsvp_status
    when v.full_name in ('Adam Szymczyk','Shanay Jhaveri') then 'tentative'::rsvp_status
    when v.full_name = 'Nicholas Logsdail' then 'declined'::rsvp_status
    when v.full_name = 'Anna Schwartz'     then 'waitlist'::rsvp_status
    else 'invited'::rsvp_status
  end,
  case when v.full_name in ('Kiran Nadar','Uli Sigg') then 1 else 0 end
from v cross join e;

-- Collectors Breakfast — patrons + senior institutions (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1,
  case when v.category = 'patrons' then 'accepted'::rsvp_status else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Collectors Breakfast'
  and v.type in ('collector','institution','curator')
on conflict do nothing;

-- Gallery Walk — curators + select collectors (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1,
  case when v.full_name in ('Hans Ulrich Obrist','Roobina Karode','Adam Szymczyk') then 'accepted'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Gallery Walk — Central Delhi'
  and v.type in ('curator','collector')
on conflict do nothing;

-- BMW Dinner — sponsors + patrons + senior galleries (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1,
  case when v.full_name in ('BMW India','Kiran Nadar','Feroze Gujral','Thaddaeus Ropac') then 'accepted'::rsvp_status
       when v.full_name = 'Glenn Lowry' then 'tentative'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'BMW Art Dinner'
  and v.type in ('collector','exhibitor','sponsor','institution')
on conflict do nothing;

-- Studio Visit — small group (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1,
  case when v.full_name in ('Hans Ulrich Obrist','Maria Balshaw','Suhanya Raffel','Uli Sigg','Subodh Gupta','Patrizia Sandretto') then 'accepted'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Studio Visit — Subodh Gupta'
  and v.full_name in ('Hans Ulrich Obrist','Maria Balshaw','Suhanya Raffel','Uli Sigg','Subodh Gupta','Patrizia Sandretto')
on conflict do nothing;

-- Press Roundtable — press only (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1, 'accepted'::rsvp_status
from vips v cross join events e
where e.name = 'Press Roundtable' and v.type = 'press'
on conflict do nothing;

-- Artist Talks — open, default invited (List 2 — broadcast list)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 2, 'invited'::rsvp_status
from vips v cross join events e
where e.name = 'Artist Talks — Women Collectors'
on conflict do nothing;

-- Preview Day — almost everyone (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1,
  case when v.full_name = 'Nicholas Logsdail' then 'declined'::rsvp_status
       else 'accepted'::rsvp_status end
from vips v cross join events e
where e.name = 'VIP Preview Day'
on conflict do nothing;

-- Institutional Dinner — institutions + select curators (List 1)
insert into invitations (vip_id, event_id, list_number, status)
select v.id, e.id, 1, 'accepted'::rsvp_status
from vips v cross join events e
where e.name = 'Institutional Dinner' and v.type in ('institution','curator','sponsor')
on conflict do nothing;
