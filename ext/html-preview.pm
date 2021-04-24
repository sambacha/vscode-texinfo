#
# ext/html-preview.pm
#
# Copyright (C) 2021  CismonX <admin@cismon.net>
#
# This file is part of vscode-texinfo.
#
# vscode-texinfo is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option)
# any later version.
#
# vscode-texinfo is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
# for more details.
#
# You should have received a copy of the GNU General Public License along with
# vscode-texinfo.  If not, see <https://www.gnu.org/licenses/>.
#

use strict;

sub vscode_convert_image_uri {
    my ( $self, $cmdname, $command, $args ) = @_;

    my $filename = $args->[0]->{'monospacetext'};
    my $prefix
        = (    defined($filename)
            && rindex( $filename, 'http://',  0 ) == -1
            && rindex( $filename, 'https://', 0 ) == -1 )
        ? $self->{'parser'}->{'values'}->{'__vscode_texinfo_image_uri_base'}
        : undef;
    $self->set_conf( 'IMAGE_LINK_PREFIX', $prefix );
    return &{ $self->default_commands_conversion($cmdname) }(@_);
}

texinfo_register_command_formatting( 'image', \&vscode_convert_image_uri );

1;
