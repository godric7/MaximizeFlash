ZIP	=	zip
RM	=	rm -rf
SRC	=	README \
		background.html	\
		content.js \
		manifest.json \
		maximize-16.png \
		maximize-32.png \
		maximize-48.png \
		maximize-128.png \
		maximize-128-white.png \
		minimize-32.png \
		style.css
NAME	=	MaximizeFlash.zip

all	:	$(NAME)

$(NAME)	:	
		$(ZIP) $(NAME) $(SRC)

clean   :
		$(RM) *~
		$(RM) #*#

fclean  :	clean
		$(RM) $(NAME)

re	:	fclean all