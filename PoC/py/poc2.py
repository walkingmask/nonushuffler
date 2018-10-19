# 連続単語くっつけるver

from janome.analyzer import Analyzer
from janome.tokenfilter import CompoundNounFilter

a = Analyzer(token_filters=[CompoundNounFilter()])
s = 'ワイシャツの下から大騒ぎするランキング トップ10 1位・職場で、フィギュアに偉そうにする(携帯ゲームがでかい) 2位・下着代わりの10円、Tシャツがおしぼり 3位・電車の中で蛾やゴキブリが柄モノスーツ姿が決まっているのに 4位・歯で思いっきり車の掃除をするが下手 5位・オフィスが職場で机の上が台 6位・代わりの店員がきっちりTシャツ、態度が透けている 7位・車の駐車車の車の駐車が電車 8位・フィギュアの態度がイマイチ 9位・職場では下着に夢中になっている 10位・ゴキブリで顔を拭く'

for token in a.analyze(s):
    if token.part_of_speech.split(',')[0] == "名詞":
        print(token.surface, end=",")

