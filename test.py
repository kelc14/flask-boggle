# from unittest import TestCase
# from app import app
# from flask import session
# from boggle import Boggle

# app.config['TESTING'] = True

# app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

# class FlaskTests(TestCase):

#     def test_word_submit(self):
#         with app.test_client() as client:
#             resp = client.post('/play', data = {'guess': 'HAND'})
#             html = resp.get_data(as_text = True)
#             self.assertIn()