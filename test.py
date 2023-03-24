from unittest import TestCase
from app import app
from boggle import Boggle
from flask import session

app.config['TESTING'] = True

app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

class FlaskTests(TestCase):
    def setUp(self):
        """ Do this before every test."""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_set_up(self):
        """Test to make sure that the html loaded properly"""

        with app.test_client() as client:
            resp = client.get('/')
            html = resp.get_data(as_text = True)
            self.assertEqual(resp.status_code, 200)
            # check that html displayed
            self.assertIn('<img src="/images/ready.gif" alt="READY ... loading gif" />',html)
            
            # check that session holds the board
            self.assertIn('board', session)
            self.assertNotIn('high_score', session)
            self.assertNotIn('play_count', session)


    def test_word_submit(self):
        """Test the processing of words on a set board in session.  Test that words respond: "ok", "not-word", or "not-on-board" properly."""
        with app.test_client() as client:
            with self.client as client:
                    #         set the board to something specific
                with client.session_transaction() as change_session:
                    change_session['board'] = [["A", "B", "C", "D", "E"], 
                                                ["F", "G", "H", "I", "J"], 
                                                ["T", "L", "M", "N", "O"], 
                                                ["E", "Q", "R", "S", "T"], 
                                                ["R", "V", "W", "X", "Y"]]
        #         test the word as something in the board
            response = self.client.get('/process?word=after')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['result'], 'ok')

            #         test a word not on the board 
            response2 = self.client.get('/process?word=apple')
            self.assertEqual(response2.status_code, 200)
            self.assertEqual(response2.json['result'], 'not-on-board')

            #         test a word that does not exist
            response3 = self.client.get('/process?word=werwervadf')
            self.assertEqual(response3.status_code, 200)
            self.assertEqual(response3.json['result'], 'not-word')

    def test_handle_stats(self):
        with app.test_client() as client:
            with client.session_transaction() as session:
        # set a playcount number without playing many games -->
                 session["play_count"] = 1123123

            resp = client.post('/handle-stats', json={'highScore': '20'})

            self.assertEqual(resp.status_code, 200)

            # Neither of these two work: 

            self.assertEqual(resp.json["playCount"], 1123124)
                    # AssertionError: 1 != 1123124
            # self.assertEqual(session['play_count'], 1123124)
            #         AssertionError: 1123123 != 1123124

