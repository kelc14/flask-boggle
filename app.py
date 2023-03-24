from boggle import Boggle
from flask import Flask, render_template, request, redirect
from flask import session, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = "test_key_for_Boggle"

boggle_game = Boggle()
play_count = 0
high_score = 0


@app.route('/')
def display_play():
    """Create new board game and display the game's HTML """
    board_letters = boggle_game.make_board()

    session['board'] = board_letters
    return render_template('index.html', letters=board_letters)

@app.route('/process')
def process_word_submission():
    """Check if word is in dictionary."""

    board = session['board']

    # get the word that was submitted and lowercase 
    word = request.args['word']
    word = word.lower()

    # check to see if word exists/on board
    result = boggle_game.check_valid_word(board, word)

    return jsonify({'result': result})

@app.route('/handle-stats', methods=["POST"])
def handle_game_stats():
    """Record high score and send back play count"""
    global play_count, high_score
    data = request.json

    high_score = data['highScore']
    session['high_score'] = high_score
    
    
    if play_count == 0:
        play_count = 0
    
    else:
        play_count = session['play_count']
    
    play_count+=1
    session['play_count'] = play_count

    return jsonify({'playCount': play_count})

